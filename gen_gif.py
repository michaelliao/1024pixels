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

def _check_length(bs, expected):
    if len(bs) != expected:
        print('error: unexpected length ' + len(bs) + ', expected = ' + expected)
        exit(1)
    return bs

def _header(w, h):
    gct = 0xf5 # 64 colors
    ratio = 0x00 # aspect ratio
    bs = struct.pack('<6shhBBB', b'GIF89a', w, h, gct, BG_COLOR, ratio)
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
    bs = struct.pack('<BBBBhBB', 0x21, 0xf9, 4, flag, delayTime, BG_COLOR, 0)
    return _check_length(bs, 8)

def _image_descriptor():
    bs = struct.pack('<BhhhhBB', 0x2c, 0, 0, WIDTH * SCALE, HEIGHT * SCALE, 0, CODE_WIDTH)
    return _check_length(bs, 11)

def _application_extension():
    bs = struct.pack('<BBB8s3sBBhB',
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

def gen_gif():
    for c in PALETTE:
        h = hex(c)[2:]
        while len(h) < 6:
            h = '0' + h
        print(f'#{h}')

    delayTime = 0

    buffer = _header(WIDTH * SCALE, HEIGHT * SCALE)

    # global PALETTE:
    buffer = buffer + _gen_color_palette()

    # buffer = buffer + _application_extension()

    ########## START FRAME ##########

    # graphic-control-extension, label, size, flag, delay-time, transparent-color-index, end:
    buffer = buffer + _graphic_control(delayTime)

    # image-descriptor, x, y, width, height, local-color-table, LZW-min-code-size:
    buffer = buffer + _image_descriptor()
    print('hex start:\n' + to_hex(buffer))

    str32B = 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'
    line1 = struct.pack(str32B, *range(0, 32))
    line2 = struct.pack(str32B, *range(32, 64))

    line3 = struct.pack(str32B, *(list(range(1, 32)) + [0]))
    line4 = struct.pack(str32B, *([63] + list(range(32, 63))))

    print('prefix: ' + to_hex(struct.pack('BB', WIDTH * SCALE + 1, CODE_CLEAR)))

    # 32x32 pixel data:
    data = (line1 + line2) * 16
    print('data:\n' + to_hex(data))
    buffer = buffer + _frame_data(data)

    ########## END FRAME ##########



    ########## START FRAME 2 ##########

    # graphic-control-extension, label, size, flag, delay-time, transparent-color-index, end:
    #buffer = buffer + _graphic_control(delayTime)

    # image-descriptor, x, y, width, height, local-color-table, LZW-min-code-size:
    #buffer = buffer + _image_descriptor()

    # 32x32 pixel data:
    #buffer = buffer + _frame_data((line3+line4)*16)

    ########## END FRAME 2 ##########


    end = b'\x3b'
    buffer = buffer + end
    return buffer

def write_gif(data):
    with open('test.gif', 'wb') as f:
        f.write(data)

def main():
    data = gen_gif()
    write_gif(data)

if __name__ == '__main__':
    main()
