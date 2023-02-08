#!/usr/bin/env python3

import os, re, json, struct, random

def load_palette():
    with open('palette.json', 'r') as f:
        s = f.read()
    ps = json.loads(s)
    pt = [int(p[1:], 16) for p in ps]
    if len(pt) > len(set(pt)):
        print('error: duplicate color.')
        exit(1)
    if len(pt) != 64:
        print('error: not 64 colors')
        exit(1)
    return pt

PALETTE = load_palette()

SCALE = 3

WIDTH = 32
HEIGHT = 32
CODE_WIDTH = 7
CODE_CLEAR = 0x80
# background color index = last color
BG_COLOR = len(PALETTE) - 1


def line(startIndex):
    bs = b''
    for i in range(WIDTH):
        r = struct.pack('B', startIndex & 0x3f)
        startIndex = startIndex + 1
        bs = bs + r * SCALE
    return bs

def to_hex(bs):
    s = ''
    ba = bytearray(bs)
    for b in ba:
        if b < 16:
            s = s + '0' + hex(b)[2:]
        else:
            s = s + hex(b)[2:]
    return s

def print_hex(bs):
    s = to_hex(bs)
    while len(s) >= 64:
        print(s[0:64])
        s = s[64:]
    if len(s) > 0:
        print(s)

def _check_length(bs, expected):
    if len(bs) != expected:
        print('error: unexpected length ' + len(bs) + ', expected = ' + expected)
        exit(1)
    return bs

def _header(w, h):
    gct = 0xf5 # 64 colors
    ratio = 0x00 # aspect ratio
    bs = struct.pack('<6sHHBBB', b'GIF89a', w, h, gct, BG_COLOR, ratio)
    return _check_length(bs, 13)

def _gen_color_palette():
    pl = b''
    for i in range(64):
        r = 0x11
        g = 0x11
        b = 0x11
        if i < len(PALETTE):
            r = (PALETTE[i] & 0xff0000) >> 16
            g = (PALETTE[i] & 0xff00) >> 8
            b = (PALETTE[i] & 0xff)
        pl = pl + struct.pack('BBB', r, g, b)
    return _check_length(pl, 64*3)

def _graphic_control(delayTime=0):
    # graphic-control-extension, label, size, flag, delay-time, transparent-color-index, end:
    flag = 0b0_0_010_001
    bs = struct.pack('<BBBBHBB', 0x21, 0xf9, 4, flag, delayTime, BG_COLOR, 0)
    print(f'graphics_ctrl(delay={delayTime}): ' + to_hex(bs))
    return _check_length(bs, 8)

def _image_descriptor():
    bs = struct.pack('<BHHHHBB', 0x2c, 0, 0, WIDTH * SCALE, HEIGHT * SCALE, 0, CODE_WIDTH)
    print('image_desc: ' + to_hex(bs))
    return _check_length(bs, 11)

def _application_extension():
    bs = struct.pack('<BBB8s3sBBHB',
        0x21, # extension label
        0xff, # application extension label
        0x0b, # block size
        # application identifier (8 bytes):
        b'NETSCAPE',
        # application authentication code (3 bytes):
        b'2.0',
        0x03, # sub-block data size 
        0x01, # sub-block id
        0, # loop count: 0 = infinite
        0 # block terminator
    )
    return _check_length(bs, 19)

def _frame_data(data):
    # check:
    if not isinstance(data, bytes):
        print('error: only support bytes.')
        exit(1)
    if len(data) != 1024:
        print('error: invalid data length.')
        exit(1)
    for i in data:
        if i < 0 or i >= 64:
            print('error: invalid index color.')
            exit(1)
    # 32x32 pixel data:
    prefix = struct.pack('BB', WIDTH * SCALE + 1, CODE_CLEAR)
    bs = b''
    for y in range(32):
        line = b''
        for x in range(32):
            c = data[y * 32 + x]
            line = line + c.to_bytes(1, 'big') * SCALE
        bs = bs + (prefix + line) * SCALE
    bs = bs + b'\x01\x81\x00' # 01=1 byte, 81=STOP, 00=end of image data
    return _check_length(bs, (2 + 32 * SCALE) * 32 * SCALE + 3)

def _end():
    return b'\x3b'

def gen_gif():
    print('load pallete...')
    for c in PALETTE:
        h = hex(c)[2:]
        while len(h) < 6:
            h = '0' + h
        print(f'#{h}')

    str32B = 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'
    line1 = struct.pack(str32B, *range(0, 32))
    line2 = struct.pack(str32B, *range(32, 64))

    line3 = struct.pack(str32B, *(list(range(1, 32)) + [0]))
    line4 = struct.pack(str32B, *([63] + list(range(32, 63))))

    frame1_data = (line1 + line2) * 16
    frame2_data =  (line3 + line4) * 16

    print('frame1 data:\n' + to_hex(frame1_data))

    # generate static gif:

    single = _header(WIDTH * SCALE, HEIGHT * SCALE) \
           + _gen_color_palette() \
           + _application_extension() \
           + _graphic_control(0) \
           + _image_descriptor() \
           + _frame_data(frame1_data) \
           + _end()

    animate = _header(WIDTH * SCALE, HEIGHT * SCALE) \
            + _gen_color_palette() \
            + _application_extension() \
            + _graphic_control(100) \
            + _image_descriptor() \
            + _frame_data(frame1_data) \
            + _graphic_control(100) \
            + _image_descriptor() \
            + _frame_data(frame2_data) \
            + _end()

    animate4 = _header(WIDTH * SCALE, HEIGHT * SCALE) \
            + _gen_color_palette() \
            + _application_extension()
    for i in range(2):
        animate4 = animate4 + _graphic_control(40) \
                 + _image_descriptor() \
                 + _frame_data(frame1_data) \
                 + _graphic_control(40) \
                 + _image_descriptor() \
                 + _frame_data(frame2_data)
    animate4 = animate4 + _end()

    write_gif('test/single.gif', single)
    write_gif('test/animate.gif', animate)
    write_gif('test/animate4.gif', animate4)

def write_gif(path, data):
    with open(path, 'wb') as f:
        f.write(data)

def main():
    gen_gif()

if __name__ == '__main__':
    main()
