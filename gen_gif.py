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

next = 0

def line(h):
    global next
    bs = b''
    upper = 5 # len(PALETTE) - 1
    for i in range(WIDTH):
        r = struct.pack('B', next & 0x3f)
        next = next + 1
        bs = bs + r * SCALE
    return bs

def to_hex(bs):
    s = ''
    ba = bytearray(bs)
    for b in ba:
        if b < 10:
            s = s + '0' + hex(b)[2:]
        else:
            s = s + hex(b)[2:]
    return s

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
    return pl

def gen_gif():
    for c in PALETTE:
        h = hex(c)[2:]
        while len(h) < 6:
            h = '0' + h
        print(f'#{h}')
    header = b'GIF89a'
    size = struct.pack('<hh', WIDTH * SCALE, HEIGHT * SCALE)
    gct = 0xf5 # 64 colors
    ratio = 0x00 # aspect ratio
    end = b'\x01\x81\x00\x3b'

    buffer = header + size
    buffer = buffer + struct.pack('BBB', gct, BG_COLOR, ratio)
    # global PALETTE:
    buffer = buffer + _gen_color_palette()

    # graphic-control-extension, label, size, flag, delay-time, transparent-color-index, end:
    buffer = buffer + struct.pack('<BBBBhBB', 0x21, 0xf9, 4, 0x01, 0, BG_COLOR, 0)
    # image-descriptor, x, y, width, height, local-color-table, LZW-min-code-size:
    buffer = buffer + struct.pack('<BhhhhBB', 0x2c, 0, 0, WIDTH * SCALE, HEIGHT * SCALE, 0, CODE_WIDTH)
    print('hex start:')

    hexBuffer = to_hex(buffer)
    print(hexBuffer)
    for i in range(100):
        iStart = i * 64
        if iStart >= len(hexBuffer):
            break
        iEnd = iStart + 64
        if iEnd > len(hexBuffer):
            iEnd = len(hexBuffer)
        print('-> ' + hexBuffer[iStart:iEnd])

    # 32x32 pixel data:
    prefix = struct.pack('BB', WIDTH * SCALE + 1, CODE_CLEAR)
    print('hex prefix:')
    print(to_hex(prefix))

    print('hex end:')
    print(to_hex(end))

    for h in range(HEIGHT):
        l = line(h)
        buffer = buffer + (prefix + l) * SCALE

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
