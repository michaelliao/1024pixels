#!/usr/bin/env python3

import os, re, json, struct, random

def load_palette():
    with open('palette.json', 'r') as f:
        s = f.read()
    ps = json.loads(s)
    return [int(p[1:], 16) for p in ps]

PALETTE = load_palette()

SCALE = 3

WIDTH = 32
HEIGHT = 32
CODE_WIDTH = 7
CODE_CLEAR = 0x80
# background color index = last color
BG_COLOR = len(PALETTE) - 1

random.seed(12345)

def line(h):
    if h >=20 and h <=24:
        b = struct.pack('B', BG_COLOR)
        return b * SCALE * 32
    bs = b''
    upper = 5 # len(PALETTE) - 1
    for i in range(WIDTH):
        r = struct.pack('B', random.randint(0, upper))
        bs = bs + r * SCALE
    return bs

def to_hex(bs):
    s = '0x'
    ba = bytearray(bs)
    for b in ba:
        if b < 10:
            s = s + '0' + hex(b)[2:]
        else:
            s = s + hex(b)[2:]
    return s

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
    for i in range(64):
        r = 0x11
        g = 0x11
        b = 0x11
        if i < len(PALETTE):
            r = (PALETTE[i] & 0xff0000) >> 16
            g = (PALETTE[i] & 0xff00) >> 8
            b = (PALETTE[i] & 0xff)
        buffer = buffer + struct.pack('BBB', r, g, b)
    # graphic-control-extension, label, size, flag, delay-time, transparent-color-index, end:
    buffer = buffer + struct.pack('<BBBBhBB', 0x21, 0xf9, 4, 0x01, 0, BG_COLOR, 0)
    # image-descriptor, x, y, width, height, local-color-table, LZW-min-code-size:
    buffer = buffer + struct.pack('<BhhhhBB', 0x2c, 0, 0, WIDTH * SCALE, HEIGHT * SCALE, 0, CODE_WIDTH)
    print('hex start:')
    print(to_hex(buffer))

    # 32x32 pixel data:
    prefix = struct.pack('BB', WIDTH * SCALE + 1, CODE_CLEAR)
    print('hex prefix:')
    print(to_hex(prefix))
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
