const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("1024 Pixels", function () {
    function toHex(n) {
        let s = n.toString(16);
        while (s.length < 2) {
            s = '0' + s;
        }
        return s;
    }

    const TOKEN_ID = '0xa3be5d9d2688e74ee8d209bbd17809a98de3791af73de52d5a0b07023454a38e';
    const PIXELS = '0x030500020201020403010200030204050104040102050500040503040401010105000102020003020004050503000005010401020005030005040105030104040502000100030105040501020403040100010200010102040201030200000005030003010005020105040003040000050302040304010205050004010003010201010101020104000405000100050301040002040300030301010100020201030101040504010304050302000005030501050404010501040102040201040405050002030002040404000500010205050002050305020302030402020503030002030001020100050500000004010303010202010205020300040202000301010001020102030100010004000203020001000301040102040402010502000000040104040503040004010404020401030303000205000302050405040002030300020203020103040400040003000004010000020104000303030003010102050103040401050301010404040501010505030005010000040000020401010201030205050305030401050304000400040405020103030500030300020103020304000101050403020405010500040505020003020505010502000503020104020100010204000001040401020101040402040200010303050403050505050304040204020400050305030501030005000500020502030503030003050500050301040003010500020105020103010202050402030002010504030002050303010402050402040103030500030201030301040402030204010302000101040005050003010200010501000002020401050404020404020202030004000403030502010200010502050004010104010502010202000005010501050001000001032f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f0304030001010504040103000205000501000002010202010201040203000201020304010405010300030102010501040504020502020500040402050304010300000504010304010005040000030105000305000302020104040105010500030102010005020503040504020102030200020505040303030300030301040002010401010004040101010105000001000002000402000304040102050000000503000203000003010302030505010504030103010305020501030003020005030200040200040100000305020403050101050203000100010301000105030500';
    const DATA_IMAGE = 'data:image/gif;base64,R0lGODlhYABgAPUvAP+AgP//gID/gAD/gID//wCA//+AwP+A//8AAP//AID/AAD/QAD//wCAwICAwP8A/4BAQP+AQAD/AACAgABAgICA/4AAQP8AgIAAAP+AAACAAACAQAAA/wAAoIAAgIAA/0AAAIBAAABAAABAQAAAgAAAQEAAQEAAgAAAAICAAICAQICAgECAgMDAwP///xERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERESH5BAEAAC8ALAAAAABgAGAAAAdhgAMDAwUFBQAAAAICAgICAgEBAQICAgQEBAMDAwEBAQICAgAAAAMDAwICAgQEBAUFBQEBAQQEBAQEBAEBAQICAgUFBQUFBQAAAAQEBAUFBQMDAwQEBAQEBAEBAQEBAQEBAWGAAwMDBQUFAAAAAgICAgICAQEBAgICBAQEAwMDAQEBAgICAAAAAwMDAgICBAQEBQUFAQEBBAQEBAQEAQEBAgICBQUFBQUFAAAABAQEBQUFAwMDBAQEBAQEAQEBAQEBAQEBYYADAwMFBQUAAAACAgICAgIBAQECAgIEBAQDAwMBAQECAgIAAAADAwMCAgIEBAQFBQUBAQEEBAQEBAQBAQECAgIFBQUFBQUAAAAEBAQFBQUDAwMEBAQEBAQBAQEBAQEBAQFhgAUFBQAAAAEBAQICAgICAgAAAAMDAwICAgAAAAQEBAUFBQUFBQMDAwAAAAAAAAUFBQEBAQQEBAEBAQICAgAAAAUFBQMDAwAAAAUFBQQEBAEBAQUFBQMDAwEBAQQEBAQEBGGABQUFAAAAAQEBAgICAgICAAAAAwMDAgICAAAABAQEBQUFBQUFAwMDAAAAAAAABQUFAQEBBAQEAQEBAgICAAAABQUFAwMDAAAABQUFBAQEAQEBBQUFAwMDAQEBBAQEBAQEYYAFBQUAAAABAQECAgICAgIAAAADAwMCAgIAAAAEBAQFBQUFBQUDAwMAAAAAAAAFBQUBAQEEBAQBAQECAgIAAAAFBQUDAwMAAAAFBQUEBAQBAQEFBQUDAwMBAQEEBAQEBARhgAUFBQICAgAAAAEBAQAAAAMDAwEBAQUFBQQEBAUFBQEBAQICAgQEBAMDAwQEBAEBAQAAAAEBAQICAgAAAAEBAQEBAQICAgQEBAICAgEBAQMDAwICAgAAAAAAAAAAAAUFBWGABQUFAgICAAAAAQEBAAAAAwMDAQEBBQUFBAQEBQUFAQEBAgICBAQEAwMDBAQEAQEBAAAAAQEBAgICAAAAAQEBAQEBAgICBAQEAgICAQEBAwMDAgICAAAAAAAAAAAABQUFYYAFBQUCAgIAAAABAQEAAAADAwMBAQEFBQUEBAQFBQUBAQECAgIEBAQDAwMEBAQBAQEAAAABAQECAgIAAAABAQEBAQECAgIEBAQCAgIBAQEDAwMCAgIAAAAAAAAAAAAFBQVhgAMDAwAAAAMDAwEBAQAAAAUFBQICAgEBAQUFBQQEBAAAAAMDAwQEBAAAAAAAAAUFBQMDAwICAgQEBAMDAwQEBAEBAQICAgUFBQUFBQAAAAQEBAEBAQAAAAMDAwEBAQICAmGAAwMDAAAAAwMDAQEBAAAABQUFAgICAQEBBQUFBAQEAAAAAwMDBAQEAAAAAAAABQUFAwMDAgICBAQEAwMDBAQEAQEBAgICBQUFBQUFAAAABAQEAQEBAAAAAwMDAQEBAgICYYADAwMAAAADAwMBAQEAAAAFBQUCAgIBAQEFBQUEBAQAAAADAwMEBAQAAAAAAAAFBQUDAwMCAgIEBAQDAwMEBAQBAQECAgIFBQUFBQUAAAAEBAQBAQEAAAADAwMBAQECAgJhgAEBAQEBAQEBAQEBAQICAgEBAQQEBAAAAAQEBAUFBQAAAAEBAQAAAAUFBQMDAwEBAQQEBAAAAAICAgQEBAMDAwAAAAMDAwMDAwEBAQEBAQEBAQAAAAICAgICAgEBAQMDA2GAAQEBAQEBAQEBAQEBAgICAQEBBAQEAAAABAQEBQUFAAAAAQEBAAAABQUFAwMDAQEBBAQEAAAAAgICBAQEAwMDAAAAAwMDAwMDAQEBAQEBAQEBAAAAAgICAgICAQEBAwMDYYABAQEBAQEBAQEBAQECAgIBAQEEBAQAAAAEBAQFBQUAAAABAQEAAAAFBQUDAwMBAQEEBAQAAAACAgIEBAQDAwMAAAADAwMDAwMBAQEBAQEBAQEAAAACAgICAgIBAQEDAwNhgAEBAQEBAQQEBAUFBQQEBAEBAQMDAwQEBAUFBQMDAwICAgAAAAAAAAUFBQMDAwUFBQEBAQUFBQQEBAQEBAEBAQUFBQEBAQQEBAEBAQICAgQEBAICAgEBAQQEBAQEBAUFBWGAAQEBAQEBBAQEBQUFBAQEAQEBAwMDBAQEBQUFAwMDAgICAAAAAAAABQUFAwMDBQUFAQEBBQUFBAQEBAQEAQEBBQUFAQEBBAQEAQEBAgICBAQEAgICAQEBBAQEBAQEBQUFYYABAQEBAQEEBAQFBQUEBAQBAQEDAwMEBAQFBQUDAwMCAgIAAAAAAAAFBQUDAwMFBQUBAQEFBQUEBAQEBAQBAQEFBQUBAQEEBAQBAQECAgIEBAQCAgIBAQEEBAQEBAQFBQVhgAUFBQAAAAICAgMDAwAAAAICAgQEBAQEBAQEBAAAAAUFBQAAAAEBAQICAgUFBQUFBQAAAAICAgUFBQMDAwUFBQICAgMDAwICAgMDAwQEBAICAgICAgUFBQMDAwMDAwAAAGGABQUFAAAAAgICAwMDAAAAAgICBAQEBAQEBAQEAAAABQUFAAAAAQEBAgICBQUFBQUFAAAAAgICBQUFAwMDBQUFAgICAwMDAgICAwMDBAQEAgICAgICBQUFAwMDAwMDAAAAYYAFBQUAAAACAgIDAwMAAAACAgIEBAQEBAQEBAQAAAAFBQUAAAABAQECAgIFBQUFBQUAAAACAgIFBQUDAwMFBQUCAgIDAwMCAgIDAwMEBAQCAgICAgIFBQUDAwMDAwMAAABhgAICAgMDAwAAAAEBAQICAgEBAQAAAAUFBQUFBQAAAAAAAAAAAAQEBAEBAQMDAwMDAwEBAQICAgICAgEBAQICAgUFBQICAgMDAwAAAAQEBAICAgICAgAAAAMDAwEBAQEBAWGAAgICAwMDAAAAAQEBAgICAQEBAAAABQUFBQUFAAAAAAAAAAAABAQEAQEBAwMDAwMDAQEBAgICAgICAQEBAgICBQUFAgICAwMDAAAABAQEAgICAgICAAAAAwMDAQEBAQEBYYACAgIDAwMAAAABAQECAgIBAQEAAAAFBQUFBQUAAAAAAAAAAAAEBAQBAQEDAwMDAwMBAQECAgICAgIBAQECAgIFBQUCAgIDAwMAAAAEBAQCAgICAgIAAAADAwMBAQEBAQFhgAAAAAEBAQICAgEBAQICAgMDAwEBAQAAAAEBAQAAAAQEBAAAAAICAgMDAwICAgAAAAEBAQAAAAMDAwEBAQQEBAEBAQICAgQEBAQEBAICAgEBAQUFBQICAgAAAAAAAAAAAGGAAAAAAQEBAgICAQEBAgICAwMDAQEBAAAAAQEBAAAABAQEAAAAAgICAwMDAgICAAAAAQEBAAAAAwMDAQEBBAQEAQEBAgICBAQEBAQEAgICAQEBBQUFAgICAAAAAAAAAAAAYYAAAAABAQECAgIBAQECAgIDAwMBAQEAAAABAQEAAAAEBAQAAAACAgIDAwMCAgIAAAABAQEAAAADAwMBAQEEBAQBAQECAgIEBAQEBAQCAgIBAQEFBQUCAgIAAAAAAAAAAABhgAQEBAEBAQQEBAQEBAUFBQMDAwQEBAAAAAQEBAEBAQQEBAQEBAICAgQEBAEBAQMDAwMDAwMDAwAAAAICAgUFBQAAAAMDAwICAgUFBQQEBAUFBQQEBAAAAAICAgMDAwMDA2GABAQEAQEBBAQEBAQEBQUFAwMDBAQEAAAABAQEAQEBBAQEBAQEAgICBAQEAQEBAwMDAwMDAwMDAAAAAgICBQUFAAAAAwMDAgICBQUFBAQEBQUFBAQEAAAAAgICAwMDAwMDYYAEBAQBAQEEBAQEBAQFBQUDAwMEBAQAAAAEBAQBAQEEBAQEBAQCAgIEBAQBAQEDAwMDAwMDAwMAAAACAgIFBQUAAAADAwMCAgIFBQUEBAQFBQUEBAQAAAACAgIDAwMDAwNhgAAAAAICAgICAgMDAwICAgEBAQMDAwQEBAQEBAAAAAQEBAAAAAMDAwAAAAAAAAQEBAEBAQAAAAAAAAICAgEBAQQEBAAAAAMDAwMDAwMDAwAAAAMDAwEBAQEBAQICAgUFBWGAAAAAAgICAgICAwMDAgICAQEBAwMDBAQEBAQEAAAABAQEAAAAAwMDAAAAAAAABAQEAQEBAAAAAAAAAgICAQEBBAQEAAAAAwMDAwMDAwMDAAAAAwMDAQEBAQEBAgICBQUFYYAAAAACAgICAgIDAwMCAgIBAQEDAwMEBAQEBAQAAAAEBAQAAAADAwMAAAAAAAAEBAQBAQEAAAAAAAACAgIBAQEEBAQAAAADAwMDAwMDAwMAAAADAwMBAQEBAQECAgIFBQVhgAEBAQMDAwQEBAQEBAEBAQUFBQMDAwEBAQEBAQQEBAQEBAQEBAUFBQEBAQEBAQUFBQUFBQMDAwAAAAUFBQEBAQAAAAAAAAQEBAAAAAAAAAICAgQEBAEBAQEBAQICAgEBAWGAAQEBAwMDBAQEBAQEAQEBBQUFAwMDAQEBAQEBBAQEBAQEBAQEBQUFAQEBAQEBBQUFBQUFAwMDAAAABQUFAQEBAAAAAAAABAQEAAAAAAAAAgICBAQEAQEBAQEBAgICAQEBYYABAQEDAwMEBAQEBAQBAQEFBQUDAwMBAQEBAQEEBAQEBAQEBAQFBQUBAQEBAQEFBQUFBQUDAwMAAAAFBQUBAQEAAAAAAAAEBAQAAAAAAAACAgIEBAQBAQEBAQECAgIBAQFhgAMDAwICAgUFBQUFBQMDAwUFBQMDAwQEBAEBAQUFBQMDAwQEBAAAAAQEBAAAAAQEBAQEBAUFBQICAgEBAQMDAwMDAwUFBQAAAAMDAwMDAwAAAAICAgEBAQMDAwICAgMDA2GAAwMDAgICBQUFBQUFAwMDBQUFAwMDBAQEAQEBBQUFAwMDBAQEAAAABAQEAAAABAQEBAQEBQUFAgICAQEBAwMDAwMDBQUFAAAAAwMDAwMDAAAAAgICAQEBAwMDAgICAwMDYYADAwMCAgIFBQUFBQUDAwMFBQUDAwMEBAQBAQEFBQUDAwMEBAQAAAAEBAQAAAAEBAQEBAQFBQUCAgIBAQEDAwMDAwMFBQUAAAADAwMDAwMAAAACAgIBAQEDAwMCAgIDAwNhgAQEBAAAAAEBAQEBAQUFBQQEBAMDAwICAgQEBAUFBQEBAQUFBQAAAAQEBAUFBQUFBQICAgAAAAMDAwICAgUFBQUFBQEBAQUFBQICAgAAAAUFBQMDAwICAgEBAQQEBAICAmGABAQEAAAAAQEBAQEBBQUFBAQEAwMDAgICBAQEBQUFAQEBBQUFAAAABAQEBQUFBQUFAgICAAAAAwMDAgICBQUFBQUFAQEBBQUFAgICAAAABQUFAwMDAgICAQEBBAQEAgICYYAEBAQAAAABAQEBAQEFBQUEBAQDAwMCAgIEBAQFBQUBAQEFBQUAAAAEBAQFBQUFBQUCAgIAAAADAwMCAgIFBQUFBQUBAQEFBQUCAgIAAAAFBQUDAwMCAgIBAQEEBAQCAgJhgAEBAQAAAAEBAQICAgQEBAAAAAAAAAEBAQQEBAQEBAEBAQICAgEBAQEBAQQEBAQEBAICAgQEBAICAgAAAAEBAQMDAwMDAwUFBQQEBAMDAwUFBQUFBQUFBQUFBQMDAwQEBGGAAQEBAAAAAQEBAgICBAQEAAAAAAAAAQEBBAQEBAQEAQEBAgICAQEBAQEBBAQEBAQEAgICBAQEAgICAAAAAQEBAwMDAwMDBQUFBAQEAwMDBQUFBQUFBQUFBQUFAwMDBAQEYYABAQEAAAABAQECAgIEBAQAAAAAAAABAQEEBAQEBAQBAQECAgIBAQEBAQEEBAQEBAQCAgIEBAQCAgIAAAABAQEDAwMDAwMFBQUEBAQDAwMFBQUFBQUFBQUFBQUDAwMEBARhgAQEBAICAgQEBAICAgQEBAAAAAUFBQMDAwUFBQMDAwUFBQEBAQMDAwAAAAUFBQAAAAUFBQAAAAICAgUFBQICAgMDAwUFBQMDAwMDAwAAAAMDAwUFBQUFBQAAAAUFBQMDA2GABAQEAgICBAQEAgICBAQEAAAABQUFAwMDBQUFAwMDBQUFAQEBAwMDAAAABQUFAAAABQUFAAAAAgICBQUFAgICAwMDBQUFAwMDAwMDAAAAAwMDBQUFBQUFAAAABQUFAwMDYYAEBAQCAgIEBAQCAgIEBAQAAAAFBQUDAwMFBQUDAwMFBQUBAQEDAwMAAAAFBQUAAAAFBQUAAAACAgIFBQUCAgIDAwMFBQUDAwMDAwMAAAADAwMFBQUFBQUAAAAFBQUDAwNhgAEBAQQEBAAAAAMDAwEBAQUFBQAAAAICAgEBAQUFBQICAgEBAQMDAwEBAQICAgICAgUFBQQEBAICAgMDAwAAAAICAgEBAQUFBQQEBAMDAwAAAAICAgUFBQMDAwMDAwEBAWGAAQEBBAQEAAAAAwMDAQEBBQUFAAAAAgICAQEBBQUFAgICAQEBAwMDAQEBAgICAgICBQUFBAQEAgICAwMDAAAAAgICAQEBBQUFBAQEAwMDAAAAAgICBQUFAwMDAwMDAQEBYYABAQEEBAQAAAADAwMBAQEFBQUAAAACAgIBAQEFBQUCAgIBAQEDAwMBAQECAgICAgIFBQUEBAQCAgIDAwMAAAACAgIBAQEFBQUEBAQDAwMAAAACAgIFBQUDAwMDAwMBAQFhgAQEBAICAgUFBQQEBAICAgQEBAEBAQMDAwMDAwUFBQAAAAMDAwICAgEBAQMDAwMDAwEBAQQEBAQEBAICAgMDAwICAgQEBAEBAQMDAwICAgAAAAEBAQEBAQQEBAAAAAUFBWGABAQEAgICBQUFBAQEAgICBAQEAQEBAwMDAwMDBQUFAAAAAwMDAgICAQEBAwMDAwMDAQEBBAQEBAQEAgICAwMDAgICBAQEAQEBAwMDAgICAAAAAQEBAQEBBAQEAAAABQUFYYAEBAQCAgIFBQUEBAQCAgIEBAQBAQEDAwMDAwMFBQUAAAADAwMCAgIBAQEDAwMDAwMBAQEEBAQEBAQCAgIDAwMCAgIEBAQBAQEDAwMCAgIAAAABAQEBAQEEBAQAAAAFBQVhgAUFBQAAAAMDAwEBAQICAgAAAAEBAQUFBQEBAQAAAAAAAAICAgICAgQEBAEBAQUFBQQEBAQEBAICAgQEBAQEBAICAgICAgICAgMDAwAAAAQEBAAAAAQEBAMDAwMDAwUFBWGABQUFAAAAAwMDAQEBAgICAAAAAQEBBQUFAQEBAAAAAAAAAgICAgICBAQEAQEBBQUFBAQEBAQEAgICBAQEBAQEAgICAgICAgICAwMDAAAABAQEAAAABAQEAwMDAwMDBQUFYYAFBQUAAAADAwMBAQECAgIAAAABAQEFBQUBAQEAAAAAAAACAgICAgIEBAQBAQEFBQUEBAQEBAQCAgIEBAQEBAQCAgICAgICAgIDAwMAAAAEBAQAAAAEBAQDAwMDAwMFBQVhgAICAgEBAQICAgAAAAEBAQUFBQICAgUFBQAAAAQEBAEBAQEBAQQEBAEBAQUFBQICAgEBAQICAgICAgAAAAAAAAUFBQEBAQUFBQEBAQUFBQAAAAEBAQAAAAAAAAEBAQMDA2GAAgICAQEBAgICAAAAAQEBBQUFAgICBQUFAAAABAQEAQEBAQEBBAQEAQEBBQUFAgICAQEBAgICAgICAAAAAAAABQUFAQEBBQUFAQEBBQUFAAAAAQEBAAAAAAAAAQEBAwMDYYACAgIBAQECAgIAAAABAQEFBQUCAgIFBQUAAAAEBAQBAQEBAQEEBAQBAQEFBQUCAgIBAQECAgICAgIAAAAAAAAFBQUBAQEFBQUBAQEFBQUAAAABAQEAAAAAAAABAQEDAwNhgC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL2GALy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vYYAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9hgC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL2GALy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vYYAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9hgC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL2GALy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vYYAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9hgC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL2GALy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vYYAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9hgC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL2GALy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vYYAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9hgAMDAwQEBAMDAwAAAAEBAQEBAQUFBQQEBAQEBAEBAQMDAwAAAAICAgUFBQAAAAUFBQEBAQAAAAAAAAICAgEBAQICAgICAgEBAQICAgEBAQQEBAICAgMDAwAAAAICAgEBAWGAAwMDBAQEAwMDAAAAAQEBAQEBBQUFBAQEBAQEAQEBAwMDAAAAAgICBQUFAAAABQUFAQEBAAAAAAAAAgICAQEBAgICAgICAQEBAgICAQEBBAQEAgICAwMDAAAAAgICAQEBYYADAwMEBAQDAwMAAAABAQEBAQEFBQUEBAQEBAQBAQEDAwMAAAACAgIFBQUAAAAFBQUBAQEAAAAAAAACAgIBAQECAgICAgIBAQECAgIBAQEEBAQCAgIDAwMAAAACAgIBAQFhgAICAgMDAwQEBAEBAQQEBAUFBQEBAQMDAwAAAAMDAwEBAQICAgEBAQUFBQEBAQQEBAUFBQQEBAICAgUFBQICAgICAgUFBQAAAAQEBAQEBAICAgUFBQMDAwQEBAEBAQMDA2GAAgICAwMDBAQEAQEBBAQEBQUFAQEBAwMDAAAAAwMDAQEBAgICAQEBBQUFAQEBBAQEBQUFBAQEAgICBQUFAgICAgICBQUFAAAABAQEBAQEAgICBQUFAwMDBAQEAQEBAwMDYYACAgIDAwMEBAQBAQEEBAQFBQUBAQEDAwMAAAADAwMBAQECAgIBAQEFBQUBAQEEBAQFBQUEBAQCAgIFBQUCAgICAgIFBQUAAAAEBAQEBAQCAgIFBQUDAwMEBAQBAQEDAwNhgAAAAAAAAAUFBQQEBAEBAQMDAwQEBAEBAQAAAAUFBQQEBAAAAAAAAAMDAwEBAQUFBQAAAAMDAwUFBQAAAAMDAwICAgICAgEBAQQEBAQEBAEBAQUFBQEBAQUFBQAAAAMDA2GAAAAAAAAABQUFBAQEAQEBAwMDBAQEAQEBAAAABQUFBAQEAAAAAAAAAwMDAQEBBQUFAAAAAwMDBQUFAAAAAwMDAgICAgICAQEBBAQEBAQEAQEBBQUFAQEBBQUFAAAAAwMDYYAAAAAAAAAFBQUEBAQBAQEDAwMEBAQBAQEAAAAFBQUEBAQAAAAAAAADAwMBAQEFBQUAAAADAwMFBQUAAAADAwMCAgICAgIBAQEEBAQEBAQBAQEFBQUBAQEFBQUAAAADAwNhgAEBAQICAgEBAQAAAAUFBQICAgUFBQMDAwQEBAUFBQQEBAICAgEBAQICAgMDAwICAgAAAAICAgUFBQUFBQQEBAMDAwMDAwMDAwMDAwAAAAMDAwMDAwEBAQQEBAAAAAICAmGAAQEBAgICAQEBAAAABQUFAgICBQUFAwMDBAQEBQUFBAQEAgICAQEBAgICAwMDAgICAAAAAgICBQUFBQUFBAQEAwMDAwMDAwMDAwMDAAAAAwMDAwMDAQEBBAQEAAAAAgICYYABAQECAgIBAQEAAAAFBQUCAgIFBQUDAwMEBAQFBQUEBAQCAgIBAQECAgIDAwMCAgIAAAACAgIFBQUFBQUEBAQDAwMDAwMDAwMDAwMAAAADAwMDAwMBAQEEBAQAAAACAgJhgAEBAQQEBAEBAQEBAQAAAAQEBAQEBAEBAQEBAQEBAQEBAQUFBQAAAAAAAAEBAQAAAAAAAAICAgAAAAQEBAICAgAAAAMDAwQEBAQEBAEBAQICAgUFBQAAAAAAAAAAAAUFBWGAAQEBBAQEAQEBAQEBAAAABAQEBAQEAQEBAQEBAQEBAQEBBQUFAAAAAAAAAQEBAAAAAAAAAgICAAAABAQEAgICAAAAAwMDBAQEBAQEAQEBAgICBQUFAAAAAAAAAAAABQUFYYABAQEEBAQBAQEBAQEAAAAEBAQEBAQBAQEBAQEBAQEBAQEFBQUAAAAAAAABAQEAAAAAAAACAgIAAAAEBAQCAgIAAAADAwMEBAQEBAQBAQECAgIFBQUAAAAAAAAAAAAFBQVhgAMDAwAAAAICAgMDAwAAAAAAAAMDAwEBAQMDAwICAgMDAwUFBQUFBQEBAQUFBQQEBAMDAwEBAQMDAwEBAQMDAwUFBQICAgUFBQEBAQMDAwAAAAMDAwICAgAAAAUFBQMDA2GAAwMDAAAAAgICAwMDAAAAAAAAAwMDAQEBAwMDAgICAwMDBQUFBQUFAQEBBQUFBAQEAwMDAQEBAwMDAQEBAwMDBQUFAgICBQUFAQEBAwMDAAAAAwMDAgICAAAABQUFAwMDYYADAwMAAAACAgIDAwMAAAAAAAADAwMBAQEDAwMCAgIDAwMFBQUFBQUBAQEFBQUEBAQDAwMBAQEDAwMBAQEDAwMFBQUCAgIFBQUBAQEDAwMAAAADAwMCAgIAAAAFBQUDAwNhgAICAgAAAAQEBAICAgAAAAQEBAEBAQAAAAAAAAMDAwUFBQICAgQEBAMDAwUFBQEBAQEBAQUFBQICAgMDAwAAAAEBAQAAAAEBAQMDAwEBAQAAAAEBAQUFBQMDAwUFBQAAAGGAAgICAAAABAQEAgICAAAABAQEAQEBAAAAAAAAAwMDBQUFAgICBAQEAwMDBQUFAQEBAQEBBQUFAgICAwMDAAAAAQEBAAAAAQEBAwMDAQEBAAAAAQEBBQUFAwMDBQUFAAAAYYACAgIAAAAEBAQCAgIAAAAEBAQBAQEAAAAAAAADAwMFBQUCAgIEBAQDAwMFBQUBAQEBAQEFBQUCAgIDAwMAAAABAQEAAAABAQEDAwMBAQEAAAABAQEFBQUDAwMFBQUAAAABgQA7';
    const DATA_JSON = 'data:application/json;base64,eyJuYW1lIjoiMTAyNCBQaXhlbHMgIyA3NDA2MzM0MTM2MDU2MDM3ODUyODkyMDMzODIxMTQ5MTYwMTM3NTUzMTEwNDM2ODI2MDE4OTEzMTY4ODg0NDY0NzIwMjk4OTMxOTA1NCIsImltYWdlIjoiZGF0YTppbWFnZS9naWY7YmFzZTY0LFIwbEdPRGxoWUFCZ0FQVXZBUCtBZ1AvL2dJRC9nQUQvZ0lELy93Q0EvLytBd1ArQS8vOEFBUC8vQUlEL0FBRC9RQUQvL3dDQXdJQ0F3UDhBLzRCQVFQK0FRQUQvQUFDQWdBQkFnSUNBLzRBQVFQOEFnSUFBQVArQUFBQ0FBQUNBUUFBQS93QUFvSUFBZ0lBQS8wQUFBSUJBQUFCQUFBQkFRQUFBZ0FBQVFFQUFRRUFBZ0FBQUFJQ0FBSUNBUUlDQWdFQ0FnTURBd1AvLy94RVJFUkVSRVJFUkVSRVJFUkVSRVJFUkVSRVJFUkVSRVJFUkVSRVJFUkVSRVJFUkVSRVJFUkVSRVJFUkVSRVJFUkVSRVNINUJBRUFBQzhBTEFBQUFBQmdBR0FBQUFkaGdBTURBd1VGQlFBQUFBSUNBZ0lDQWdFQkFRSUNBZ1FFQkFNREF3RUJBUUlDQWdBQUFBTURBd0lDQWdRRUJBVUZCUUVCQVFRRUJBUUVCQUVCQVFJQ0FnVUZCUVVGQlFBQUFBUUVCQVVGQlFNREF3UUVCQVFFQkFFQkFRRUJBUUVCQVdHQUF3TURCUVVGQUFBQUFnSUNBZ0lDQVFFQkFnSUNCQVFFQXdNREFRRUJBZ0lDQUFBQUF3TURBZ0lDQkFRRUJRVUZBUUVCQkFRRUJBUUVBUUVCQWdJQ0JRVUZCUVVGQUFBQUJBUUVCUVVGQXdNREJBUUVCQVFFQVFFQkFRRUJBUUVCWVlBREF3TUZCUVVBQUFBQ0FnSUNBZ0lCQVFFQ0FnSUVCQVFEQXdNQkFRRUNBZ0lBQUFBREF3TUNBZ0lFQkFRRkJRVUJBUUVFQkFRRUJBUUJBUUVDQWdJRkJRVUZCUVVBQUFBRUJBUUZCUVVEQXdNRUJBUUVCQVFCQVFFQkFRRUJBUUZoZ0FVRkJRQUFBQUVCQVFJQ0FnSUNBZ0FBQUFNREF3SUNBZ0FBQUFRRUJBVUZCUVVGQlFNREF3QUFBQUFBQUFVRkJRRUJBUVFFQkFFQkFRSUNBZ0FBQUFVRkJRTURBd0FBQUFVRkJRUUVCQUVCQVFVRkJRTURBd0VCQVFRRUJBUUVCR0dBQlFVRkFBQUFBUUVCQWdJQ0FnSUNBQUFBQXdNREFnSUNBQUFBQkFRRUJRVUZCUVVGQXdNREFBQUFBQUFBQlFVRkFRRUJCQVFFQVFFQkFnSUNBQUFBQlFVRkF3TURBQUFBQlFVRkJBUUVBUUVCQlFVRkF3TURBUUVCQkFRRUJBUUVZWUFGQlFVQUFBQUJBUUVDQWdJQ0FnSUFBQUFEQXdNQ0FnSUFBQUFFQkFRRkJRVUZCUVVEQXdNQUFBQUFBQUFGQlFVQkFRRUVCQVFCQVFFQ0FnSUFBQUFGQlFVREF3TUFBQUFGQlFVRUJBUUJBUUVGQlFVREF3TUJBUUVFQkFRRUJBUmhnQVVGQlFJQ0FnQUFBQUVCQVFBQUFBTURBd0VCQVFVRkJRUUVCQVVGQlFFQkFRSUNBZ1FFQkFNREF3UUVCQUVCQVFBQUFBRUJBUUlDQWdBQUFBRUJBUUVCQVFJQ0FnUUVCQUlDQWdFQkFRTURBd0lDQWdBQUFBQUFBQUFBQUFVRkJXR0FCUVVGQWdJQ0FBQUFBUUVCQUFBQUF3TURBUUVCQlFVRkJBUUVCUVVGQVFFQkFnSUNCQVFFQXdNREJBUUVBUUVCQUFBQUFRRUJBZ0lDQUFBQUFRRUJBUUVCQWdJQ0JBUUVBZ0lDQVFFQkF3TURBZ0lDQUFBQUFBQUFBQUFBQlFVRllZQUZCUVVDQWdJQUFBQUJBUUVBQUFBREF3TUJBUUVGQlFVRUJBUUZCUVVCQVFFQ0FnSUVCQVFEQXdNRUJBUUJBUUVBQUFBQkFRRUNBZ0lBQUFBQkFRRUJBUUVDQWdJRUJBUUNBZ0lCQVFFREF3TUNBZ0lBQUFBQUFBQUFBQUFGQlFWaGdBTURBd0FBQUFNREF3RUJBUUFBQUFVRkJRSUNBZ0VCQVFVRkJRUUVCQUFBQUFNREF3UUVCQUFBQUFBQUFBVUZCUU1EQXdJQ0FnUUVCQU1EQXdRRUJBRUJBUUlDQWdVRkJRVUZCUUFBQUFRRUJBRUJBUUFBQUFNREF3RUJBUUlDQW1HQUF3TURBQUFBQXdNREFRRUJBQUFBQlFVRkFnSUNBUUVCQlFVRkJBUUVBQUFBQXdNREJBUUVBQUFBQUFBQUJRVUZBd01EQWdJQ0JBUUVBd01EQkFRRUFRRUJBZ0lDQlFVRkJRVUZBQUFBQkFRRUFRRUJBQUFBQXdNREFRRUJBZ0lDWVlBREF3TUFBQUFEQXdNQkFRRUFBQUFGQlFVQ0FnSUJBUUVGQlFVRUJBUUFBQUFEQXdNRUJBUUFBQUFBQUFBRkJRVURBd01DQWdJRUJBUURBd01FQkFRQkFRRUNBZ0lGQlFVRkJRVUFBQUFFQkFRQkFRRUFBQUFEQXdNQkFRRUNBZ0poZ0FFQkFRRUJBUUVCQVFFQkFRSUNBZ0VCQVFRRUJBQUFBQVFFQkFVRkJRQUFBQUVCQVFBQUFBVUZCUU1EQXdFQkFRUUVCQUFBQUFJQ0FnUUVCQU1EQXdBQUFBTURBd01EQXdFQkFRRUJBUUVCQVFBQUFBSUNBZ0lDQWdFQkFRTURBMkdBQVFFQkFRRUJBUUVCQVFFQkFnSUNBUUVCQkFRRUFBQUFCQVFFQlFVRkFBQUFBUUVCQUFBQUJRVUZBd01EQVFFQkJBUUVBQUFBQWdJQ0JBUUVBd01EQUFBQUF3TURBd01EQVFFQkFRRUJBUUVCQUFBQUFnSUNBZ0lDQVFFQkF3TURZWUFCQVFFQkFRRUJBUUVCQVFFQ0FnSUJBUUVFQkFRQUFBQUVCQVFGQlFVQUFBQUJBUUVBQUFBRkJRVURBd01CQVFFRUJBUUFBQUFDQWdJRUJBUURBd01BQUFBREF3TURBd01CQVFFQkFRRUJBUUVBQUFBQ0FnSUNBZ0lCQVFFREF3TmhnQUVCQVFFQkFRUUVCQVVGQlFRRUJBRUJBUU1EQXdRRUJBVUZCUU1EQXdJQ0FnQUFBQUFBQUFVRkJRTURBd1VGQlFFQkFRVUZCUVFFQkFRRUJBRUJBUVVGQlFFQkFRUUVCQUVCQVFJQ0FnUUVCQUlDQWdFQkFRUUVCQVFFQkFVRkJXR0FBUUVCQVFFQkJBUUVCUVVGQkFRRUFRRUJBd01EQkFRRUJRVUZBd01EQWdJQ0FBQUFBQUFBQlFVRkF3TURCUVVGQVFFQkJRVUZCQVFFQkFRRUFRRUJCUVVGQVFFQkJBUUVBUUVCQWdJQ0JBUUVBZ0lDQVFFQkJBUUVCQVFFQlFVRllZQUJBUUVCQVFFRUJBUUZCUVVFQkFRQkFRRURBd01FQkFRRkJRVURBd01DQWdJQUFBQUFBQUFGQlFVREF3TUZCUVVCQVFFRkJRVUVCQVFFQkFRQkFRRUZCUVVCQVFFRUJBUUJBUUVDQWdJRUJBUUNBZ0lCQVFFRUJBUUVCQVFGQlFWaGdBVUZCUUFBQUFJQ0FnTURBd0FBQUFJQ0FnUUVCQVFFQkFRRUJBQUFBQVVGQlFBQUFBRUJBUUlDQWdVRkJRVUZCUUFBQUFJQ0FnVUZCUU1EQXdVRkJRSUNBZ01EQXdJQ0FnTURBd1FFQkFJQ0FnSUNBZ1VGQlFNREF3TURBd0FBQUdHQUJRVUZBQUFBQWdJQ0F3TURBQUFBQWdJQ0JBUUVCQVFFQkFRRUFBQUFCUVVGQUFBQUFRRUJBZ0lDQlFVRkJRVUZBQUFBQWdJQ0JRVUZBd01EQlFVRkFnSUNBd01EQWdJQ0F3TURCQVFFQWdJQ0FnSUNCUVVGQXdNREF3TURBQUFBWVlBRkJRVUFBQUFDQWdJREF3TUFBQUFDQWdJRUJBUUVCQVFFQkFRQUFBQUZCUVVBQUFBQkFRRUNBZ0lGQlFVRkJRVUFBQUFDQWdJRkJRVURBd01GQlFVQ0FnSURBd01DQWdJREF3TUVCQVFDQWdJQ0FnSUZCUVVEQXdNREF3TUFBQUJoZ0FJQ0FnTURBd0FBQUFFQkFRSUNBZ0VCQVFBQUFBVUZCUVVGQlFBQUFBQUFBQUFBQUFRRUJBRUJBUU1EQXdNREF3RUJBUUlDQWdJQ0FnRUJBUUlDQWdVRkJRSUNBZ01EQXdBQUFBUUVCQUlDQWdJQ0FnQUFBQU1EQXdFQkFRRUJBV0dBQWdJQ0F3TURBQUFBQVFFQkFnSUNBUUVCQUFBQUJRVUZCUVVGQUFBQUFBQUFBQUFBQkFRRUFRRUJBd01EQXdNREFRRUJBZ0lDQWdJQ0FRRUJBZ0lDQlFVRkFnSUNBd01EQUFBQUJBUUVBZ0lDQWdJQ0FBQUFBd01EQVFFQkFRRUJZWUFDQWdJREF3TUFBQUFCQVFFQ0FnSUJBUUVBQUFBRkJRVUZCUVVBQUFBQUFBQUFBQUFFQkFRQkFRRURBd01EQXdNQkFRRUNBZ0lDQWdJQkFRRUNBZ0lGQlFVQ0FnSURBd01BQUFBRUJBUUNBZ0lDQWdJQUFBQURBd01CQVFFQkFRRmhnQUFBQUFFQkFRSUNBZ0VCQVFJQ0FnTURBd0VCQVFBQUFBRUJBUUFBQUFRRUJBQUFBQUlDQWdNREF3SUNBZ0FBQUFFQkFRQUFBQU1EQXdFQkFRUUVCQUVCQVFJQ0FnUUVCQVFFQkFJQ0FnRUJBUVVGQlFJQ0FnQUFBQUFBQUFBQUFHR0FBQUFBQVFFQkFnSUNBUUVCQWdJQ0F3TURBUUVCQUFBQUFRRUJBQUFBQkFRRUFBQUFBZ0lDQXdNREFnSUNBQUFBQVFFQkFBQUFBd01EQVFFQkJBUUVBUUVCQWdJQ0JBUUVCQVFFQWdJQ0FRRUJCUVVGQWdJQ0FBQUFBQUFBQUFBQVlZQUFBQUFCQVFFQ0FnSUJBUUVDQWdJREF3TUJBUUVBQUFBQkFRRUFBQUFFQkFRQUFBQUNBZ0lEQXdNQ0FnSUFBQUFCQVFFQUFBQURBd01CQVFFRUJBUUJBUUVDQWdJRUJBUUVCQVFDQWdJQkFRRUZCUVVDQWdJQUFBQUFBQUFBQUFCaGdBUUVCQUVCQVFRRUJBUUVCQVVGQlFNREF3UUVCQUFBQUFRRUJBRUJBUVFFQkFRRUJBSUNBZ1FFQkFFQkFRTURBd01EQXdNREF3QUFBQUlDQWdVRkJRQUFBQU1EQXdJQ0FnVUZCUVFFQkFVRkJRUUVCQUFBQUFJQ0FnTURBd01EQTJHQUJBUUVBUUVCQkFRRUJBUUVCUVVGQXdNREJBUUVBQUFBQkFRRUFRRUJCQVFFQkFRRUFnSUNCQVFFQVFFQkF3TURBd01EQXdNREFBQUFBZ0lDQlFVRkFBQUFBd01EQWdJQ0JRVUZCQVFFQlFVRkJBUUVBQUFBQWdJQ0F3TURBd01EWVlBRUJBUUJBUUVFQkFRRUJBUUZCUVVEQXdNRUJBUUFBQUFFQkFRQkFRRUVCQVFFQkFRQ0FnSUVCQVFCQVFFREF3TURBd01EQXdNQUFBQUNBZ0lGQlFVQUFBQURBd01DQWdJRkJRVUVCQVFGQlFVRUJBUUFBQUFDQWdJREF3TURBd05oZ0FBQUFBSUNBZ0lDQWdNREF3SUNBZ0VCQVFNREF3UUVCQVFFQkFBQUFBUUVCQUFBQUFNREF3QUFBQUFBQUFRRUJBRUJBUUFBQUFBQUFBSUNBZ0VCQVFRRUJBQUFBQU1EQXdNREF3TURBd0FBQUFNREF3RUJBUUVCQVFJQ0FnVUZCV0dBQUFBQUFnSUNBZ0lDQXdNREFnSUNBUUVCQXdNREJBUUVCQVFFQUFBQUJBUUVBQUFBQXdNREFBQUFBQUFBQkFRRUFRRUJBQUFBQUFBQUFnSUNBUUVCQkFRRUFBQUFBd01EQXdNREF3TURBQUFBQXdNREFRRUJBUUVCQWdJQ0JRVUZZWUFBQUFBQ0FnSUNBZ0lEQXdNQ0FnSUJBUUVEQXdNRUJBUUVCQVFBQUFBRUJBUUFBQUFEQXdNQUFBQUFBQUFFQkFRQkFRRUFBQUFBQUFBQ0FnSUJBUUVFQkFRQUFBQURBd01EQXdNREF3TUFBQUFEQXdNQkFRRUJBUUVDQWdJRkJRVmhnQUVCQVFNREF3UUVCQVFFQkFFQkFRVUZCUU1EQXdFQkFRRUJBUVFFQkFRRUJBUUVCQVVGQlFFQkFRRUJBUVVGQlFVRkJRTURBd0FBQUFVRkJRRUJBUUFBQUFBQUFBUUVCQUFBQUFBQUFBSUNBZ1FFQkFFQkFRRUJBUUlDQWdFQkFXR0FBUUVCQXdNREJBUUVCQVFFQVFFQkJRVUZBd01EQVFFQkFRRUJCQVFFQkFRRUJBUUVCUVVGQVFFQkFRRUJCUVVGQlFVRkF3TURBQUFBQlFVRkFRRUJBQUFBQUFBQUJBUUVBQUFBQUFBQUFnSUNCQVFFQVFFQkFRRUJBZ0lDQVFFQllZQUJBUUVEQXdNRUJBUUVCQVFCQVFFRkJRVURBd01CQVFFQkFRRUVCQVFFQkFRRUJBUUZCUVVCQVFFQkFRRUZCUVVGQlFVREF3TUFBQUFGQlFVQkFRRUFBQUFBQUFBRUJBUUFBQUFBQUFBQ0FnSUVCQVFCQVFFQkFRRUNBZ0lCQVFGaGdBTURBd0lDQWdVRkJRVUZCUU1EQXdVRkJRTURBd1FFQkFFQkFRVUZCUU1EQXdRRUJBQUFBQVFFQkFBQUFBUUVCQVFFQkFVRkJRSUNBZ0VCQVFNREF3TURBd1VGQlFBQUFBTURBd01EQXdBQUFBSUNBZ0VCQVFNREF3SUNBZ01EQTJHQUF3TURBZ0lDQlFVRkJRVUZBd01EQlFVRkF3TURCQVFFQVFFQkJRVUZBd01EQkFRRUFBQUFCQVFFQUFBQUJBUUVCQVFFQlFVRkFnSUNBUUVCQXdNREF3TURCUVVGQUFBQUF3TURBd01EQUFBQUFnSUNBUUVCQXdNREFnSUNBd01EWVlBREF3TUNBZ0lGQlFVRkJRVURBd01GQlFVREF3TUVCQVFCQVFFRkJRVURBd01FQkFRQUFBQUVCQVFBQUFBRUJBUUVCQVFGQlFVQ0FnSUJBUUVEQXdNREF3TUZCUVVBQUFBREF3TURBd01BQUFBQ0FnSUJBUUVEQXdNQ0FnSURBd05oZ0FRRUJBQUFBQUVCQVFFQkFRVUZCUVFFQkFNREF3SUNBZ1FFQkFVRkJRRUJBUVVGQlFBQUFBUUVCQVVGQlFVRkJRSUNBZ0FBQUFNREF3SUNBZ1VGQlFVRkJRRUJBUVVGQlFJQ0FnQUFBQVVGQlFNREF3SUNBZ0VCQVFRRUJBSUNBbUdBQkFRRUFBQUFBUUVCQVFFQkJRVUZCQVFFQXdNREFnSUNCQVFFQlFVRkFRRUJCUVVGQUFBQUJBUUVCUVVGQlFVRkFnSUNBQUFBQXdNREFnSUNCUVVGQlFVRkFRRUJCUVVGQWdJQ0FBQUFCUVVGQXdNREFnSUNBUUVCQkFRRUFnSUNZWUFFQkFRQUFBQUJBUUVCQVFFRkJRVUVCQVFEQXdNQ0FnSUVCQVFGQlFVQkFRRUZCUVVBQUFBRUJBUUZCUVVGQlFVQ0FnSUFBQUFEQXdNQ0FnSUZCUVVGQlFVQkFRRUZCUVVDQWdJQUFBQUZCUVVEQXdNQ0FnSUJBUUVFQkFRQ0FnSmhnQUVCQVFBQUFBRUJBUUlDQWdRRUJBQUFBQUFBQUFFQkFRUUVCQVFFQkFFQkFRSUNBZ0VCQVFFQkFRUUVCQVFFQkFJQ0FnUUVCQUlDQWdBQUFBRUJBUU1EQXdNREF3VUZCUVFFQkFNREF3VUZCUVVGQlFVRkJRVUZCUU1EQXdRRUJHR0FBUUVCQUFBQUFRRUJBZ0lDQkFRRUFBQUFBQUFBQVFFQkJBUUVCQVFFQVFFQkFnSUNBUUVCQVFFQkJBUUVCQVFFQWdJQ0JBUUVBZ0lDQUFBQUFRRUJBd01EQXdNREJRVUZCQVFFQXdNREJRVUZCUVVGQlFVRkJRVUZBd01EQkFRRVlZQUJBUUVBQUFBQkFRRUNBZ0lFQkFRQUFBQUFBQUFCQVFFRUJBUUVCQVFCQVFFQ0FnSUJBUUVCQVFFRUJBUUVCQVFDQWdJRUJBUUNBZ0lBQUFBQkFRRURBd01EQXdNRkJRVUVCQVFEQXdNRkJRVUZCUVVGQlFVRkJRVURBd01FQkFSaGdBUUVCQUlDQWdRRUJBSUNBZ1FFQkFBQUFBVUZCUU1EQXdVRkJRTURBd1VGQlFFQkFRTURBd0FBQUFVRkJRQUFBQVVGQlFBQUFBSUNBZ1VGQlFJQ0FnTURBd1VGQlFNREF3TURBd0FBQUFNREF3VUZCUVVGQlFBQUFBVUZCUU1EQTJHQUJBUUVBZ0lDQkFRRUFnSUNCQVFFQUFBQUJRVUZBd01EQlFVRkF3TURCUVVGQVFFQkF3TURBQUFBQlFVRkFBQUFCUVVGQUFBQUFnSUNCUVVGQWdJQ0F3TURCUVVGQXdNREF3TURBQUFBQXdNREJRVUZCUVVGQUFBQUJRVUZBd01EWVlBRUJBUUNBZ0lFQkFRQ0FnSUVCQVFBQUFBRkJRVURBd01GQlFVREF3TUZCUVVCQVFFREF3TUFBQUFGQlFVQUFBQUZCUVVBQUFBQ0FnSUZCUVVDQWdJREF3TUZCUVVEQXdNREF3TUFBQUFEQXdNRkJRVUZCUVVBQUFBRkJRVURBd05oZ0FFQkFRUUVCQUFBQUFNREF3RUJBUVVGQlFBQUFBSUNBZ0VCQVFVRkJRSUNBZ0VCQVFNREF3RUJBUUlDQWdJQ0FnVUZCUVFFQkFJQ0FnTURBd0FBQUFJQ0FnRUJBUVVGQlFRRUJBTURBd0FBQUFJQ0FnVUZCUU1EQXdNREF3RUJBV0dBQVFFQkJBUUVBQUFBQXdNREFRRUJCUVVGQUFBQUFnSUNBUUVCQlFVRkFnSUNBUUVCQXdNREFRRUJBZ0lDQWdJQ0JRVUZCQVFFQWdJQ0F3TURBQUFBQWdJQ0FRRUJCUVVGQkFRRUF3TURBQUFBQWdJQ0JRVUZBd01EQXdNREFRRUJZWUFCQVFFRUJBUUFBQUFEQXdNQkFRRUZCUVVBQUFBQ0FnSUJBUUVGQlFVQ0FnSUJBUUVEQXdNQkFRRUNBZ0lDQWdJRkJRVUVCQVFDQWdJREF3TUFBQUFDQWdJQkFRRUZCUVVFQkFRREF3TUFBQUFDQWdJRkJRVURBd01EQXdNQkFRRmhnQVFFQkFJQ0FnVUZCUVFFQkFJQ0FnUUVCQUVCQVFNREF3TURBd1VGQlFBQUFBTURBd0lDQWdFQkFRTURBd01EQXdFQkFRUUVCQVFFQkFJQ0FnTURBd0lDQWdRRUJBRUJBUU1EQXdJQ0FnQUFBQUVCQVFFQkFRUUVCQUFBQUFVRkJXR0FCQVFFQWdJQ0JRVUZCQVFFQWdJQ0JBUUVBUUVCQXdNREF3TURCUVVGQUFBQUF3TURBZ0lDQVFFQkF3TURBd01EQVFFQkJBUUVCQVFFQWdJQ0F3TURBZ0lDQkFRRUFRRUJBd01EQWdJQ0FBQUFBUUVCQVFFQkJBUUVBQUFBQlFVRllZQUVCQVFDQWdJRkJRVUVCQVFDQWdJRUJBUUJBUUVEQXdNREF3TUZCUVVBQUFBREF3TUNBZ0lCQVFFREF3TURBd01CQVFFRUJBUUVCQVFDQWdJREF3TUNBZ0lFQkFRQkFRRURBd01DQWdJQUFBQUJBUUVCQVFFRUJBUUFBQUFGQlFWaGdBVUZCUUFBQUFNREF3RUJBUUlDQWdBQUFBRUJBUVVGQlFFQkFRQUFBQUFBQUFJQ0FnSUNBZ1FFQkFFQkFRVUZCUVFFQkFRRUJBSUNBZ1FFQkFRRUJBSUNBZ0lDQWdJQ0FnTURBd0FBQUFRRUJBQUFBQVFFQkFNREF3TURBd1VGQldHQUJRVUZBQUFBQXdNREFRRUJBZ0lDQUFBQUFRRUJCUVVGQVFFQkFBQUFBQUFBQWdJQ0FnSUNCQVFFQVFFQkJRVUZCQVFFQkFRRUFnSUNCQVFFQkFRRUFnSUNBZ0lDQWdJQ0F3TURBQUFBQkFRRUFBQUFCQVFFQXdNREF3TURCUVVGWVlBRkJRVUFBQUFEQXdNQkFRRUNBZ0lBQUFBQkFRRUZCUVVCQVFFQUFBQUFBQUFDQWdJQ0FnSUVCQVFCQVFFRkJRVUVCQVFFQkFRQ0FnSUVCQVFFQkFRQ0FnSUNBZ0lDQWdJREF3TUFBQUFFQkFRQUFBQUVCQVFEQXdNREF3TUZCUVZoZ0FJQ0FnRUJBUUlDQWdBQUFBRUJBUVVGQlFJQ0FnVUZCUUFBQUFRRUJBRUJBUUVCQVFRRUJBRUJBUVVGQlFJQ0FnRUJBUUlDQWdJQ0FnQUFBQUFBQUFVRkJRRUJBUVVGQlFFQkFRVUZCUUFBQUFFQkFRQUFBQUFBQUFFQkFRTURBMkdBQWdJQ0FRRUJBZ0lDQUFBQUFRRUJCUVVGQWdJQ0JRVUZBQUFBQkFRRUFRRUJBUUVCQkFRRUFRRUJCUVVGQWdJQ0FRRUJBZ0lDQWdJQ0FBQUFBQUFBQlFVRkFRRUJCUVVGQVFFQkJRVUZBQUFBQVFFQkFBQUFBQUFBQVFFQkF3TURZWUFDQWdJQkFRRUNBZ0lBQUFBQkFRRUZCUVVDQWdJRkJRVUFBQUFFQkFRQkFRRUJBUUVFQkFRQkFRRUZCUVVDQWdJQkFRRUNBZ0lDQWdJQUFBQUFBQUFGQlFVQkFRRUZCUVVCQVFFRkJRVUFBQUFCQVFFQUFBQUFBQUFCQVFFREF3TmhnQzh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkwyR0FMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dllZQXZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk5aGdDOHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2TDJHQUx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2WVlBdkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTloZ0M4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMMkdBTHk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZZWUF2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OWhnQzh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkwyR0FMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dllZQXZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk5aGdDOHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2TDJHQUx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2WVlBdkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTh2THk4dkx5OHZMeTloZ0FNREF3UUVCQU1EQXdBQUFBRUJBUUVCQVFVRkJRUUVCQVFFQkFFQkFRTURBd0FBQUFJQ0FnVUZCUUFBQUFVRkJRRUJBUUFBQUFBQUFBSUNBZ0VCQVFJQ0FnSUNBZ0VCQVFJQ0FnRUJBUVFFQkFJQ0FnTURBd0FBQUFJQ0FnRUJBV0dBQXdNREJBUUVBd01EQUFBQUFRRUJBUUVCQlFVRkJBUUVCQVFFQVFFQkF3TURBQUFBQWdJQ0JRVUZBQUFBQlFVRkFRRUJBQUFBQUFBQUFnSUNBUUVCQWdJQ0FnSUNBUUVCQWdJQ0FRRUJCQVFFQWdJQ0F3TURBQUFBQWdJQ0FRRUJZWUFEQXdNRUJBUURBd01BQUFBQkFRRUJBUUVGQlFVRUJBUUVCQVFCQVFFREF3TUFBQUFDQWdJRkJRVUFBQUFGQlFVQkFRRUFBQUFBQUFBQ0FnSUJBUUVDQWdJQ0FnSUJBUUVDQWdJQkFRRUVCQVFDQWdJREF3TUFBQUFDQWdJQkFRRmhnQUlDQWdNREF3UUVCQUVCQVFRRUJBVUZCUUVCQVFNREF3QUFBQU1EQXdFQkFRSUNBZ0VCQVFVRkJRRUJBUVFFQkFVRkJRUUVCQUlDQWdVRkJRSUNBZ0lDQWdVRkJRQUFBQVFFQkFRRUJBSUNBZ1VGQlFNREF3UUVCQUVCQVFNREEyR0FBZ0lDQXdNREJBUUVBUUVCQkFRRUJRVUZBUUVCQXdNREFBQUFBd01EQVFFQkFnSUNBUUVCQlFVRkFRRUJCQVFFQlFVRkJBUUVBZ0lDQlFVRkFnSUNBZ0lDQlFVRkFBQUFCQVFFQkFRRUFnSUNCUVVGQXdNREJBUUVBUUVCQXdNRFlZQUNBZ0lEQXdNRUJBUUJBUUVFQkFRRkJRVUJBUUVEQXdNQUFBQURBd01CQVFFQ0FnSUJBUUVGQlFVQkFRRUVCQVFGQlFVRUJBUUNBZ0lGQlFVQ0FnSUNBZ0lGQlFVQUFBQUVCQVFFQkFRQ0FnSUZCUVVEQXdNRUJBUUJBUUVEQXdOaGdBQUFBQUFBQUFVRkJRUUVCQUVCQVFNREF3UUVCQUVCQVFBQUFBVUZCUVFFQkFBQUFBQUFBQU1EQXdFQkFRVUZCUUFBQUFNREF3VUZCUUFBQUFNREF3SUNBZ0lDQWdFQkFRUUVCQVFFQkFFQkFRVUZCUUVCQVFVRkJRQUFBQU1EQTJHQUFBQUFBQUFBQlFVRkJBUUVBUUVCQXdNREJBUUVBUUVCQUFBQUJRVUZCQVFFQUFBQUFBQUFBd01EQVFFQkJRVUZBQUFBQXdNREJRVUZBQUFBQXdNREFnSUNBZ0lDQVFFQkJBUUVCQVFFQVFFQkJRVUZBUUVCQlFVRkFBQUFBd01EWVlBQUFBQUFBQUFGQlFVRUJBUUJBUUVEQXdNRUJBUUJBUUVBQUFBRkJRVUVCQVFBQUFBQUFBQURBd01CQVFFRkJRVUFBQUFEQXdNRkJRVUFBQUFEQXdNQ0FnSUNBZ0lCQVFFRUJBUUVCQVFCQVFFRkJRVUJBUUVGQlFVQUFBQURBd05oZ0FFQkFRSUNBZ0VCQVFBQUFBVUZCUUlDQWdVRkJRTURBd1FFQkFVRkJRUUVCQUlDQWdFQkFRSUNBZ01EQXdJQ0FnQUFBQUlDQWdVRkJRVUZCUVFFQkFNREF3TURBd01EQXdNREF3QUFBQU1EQXdNREF3RUJBUVFFQkFBQUFBSUNBbUdBQVFFQkFnSUNBUUVCQUFBQUJRVUZBZ0lDQlFVRkF3TURCQVFFQlFVRkJBUUVBZ0lDQVFFQkFnSUNBd01EQWdJQ0FBQUFBZ0lDQlFVRkJRVUZCQVFFQXdNREF3TURBd01EQXdNREFBQUFBd01EQXdNREFRRUJCQVFFQUFBQUFnSUNZWUFCQVFFQ0FnSUJBUUVBQUFBRkJRVUNBZ0lGQlFVREF3TUVCQVFGQlFVRUJBUUNBZ0lCQVFFQ0FnSURBd01DQWdJQUFBQUNBZ0lGQlFVRkJRVUVCQVFEQXdNREF3TURBd01EQXdNQUFBQURBd01EQXdNQkFRRUVCQVFBQUFBQ0FnSmhnQUVCQVFRRUJBRUJBUUVCQVFBQUFBUUVCQVFFQkFFQkFRRUJBUUVCQVFFQkFRVUZCUUFBQUFBQUFBRUJBUUFBQUFBQUFBSUNBZ0FBQUFRRUJBSUNBZ0FBQUFNREF3UUVCQVFFQkFFQkFRSUNBZ1VGQlFBQUFBQUFBQUFBQUFVRkJXR0FBUUVCQkFRRUFRRUJBUUVCQUFBQUJBUUVCQVFFQVFFQkFRRUJBUUVCQVFFQkJRVUZBQUFBQUFBQUFRRUJBQUFBQUFBQUFnSUNBQUFBQkFRRUFnSUNBQUFBQXdNREJBUUVCQVFFQVFFQkFnSUNCUVVGQUFBQUFBQUFBQUFBQlFVRllZQUJBUUVFQkFRQkFRRUJBUUVBQUFBRUJBUUVCQVFCQVFFQkFRRUJBUUVCQVFFRkJRVUFBQUFBQUFBQkFRRUFBQUFBQUFBQ0FnSUFBQUFFQkFRQ0FnSUFBQUFEQXdNRUJBUUVCQVFCQVFFQ0FnSUZCUVVBQUFBQUFBQUFBQUFGQlFWaGdBTURBd0FBQUFJQ0FnTURBd0FBQUFBQUFBTURBd0VCQVFNREF3SUNBZ01EQXdVRkJRVUZCUUVCQVFVRkJRUUVCQU1EQXdFQkFRTURBd0VCQVFNREF3VUZCUUlDQWdVRkJRRUJBUU1EQXdBQUFBTURBd0lDQWdBQUFBVUZCUU1EQTJHQUF3TURBQUFBQWdJQ0F3TURBQUFBQUFBQUF3TURBUUVCQXdNREFnSUNBd01EQlFVRkJRVUZBUUVCQlFVRkJBUUVBd01EQVFFQkF3TURBUUVCQXdNREJRVUZBZ0lDQlFVRkFRRUJBd01EQUFBQUF3TURBZ0lDQUFBQUJRVUZBd01EWVlBREF3TUFBQUFDQWdJREF3TUFBQUFBQUFBREF3TUJBUUVEQXdNQ0FnSURBd01GQlFVRkJRVUJBUUVGQlFVRUJBUURBd01CQVFFREF3TUJBUUVEQXdNRkJRVUNBZ0lGQlFVQkFRRURBd01BQUFBREF3TUNBZ0lBQUFBRkJRVURBd05oZ0FJQ0FnQUFBQVFFQkFJQ0FnQUFBQVFFQkFFQkFRQUFBQUFBQUFNREF3VUZCUUlDQWdRRUJBTURBd1VGQlFFQkFRRUJBUVVGQlFJQ0FnTURBd0FBQUFFQkFRQUFBQUVCQVFNREF3RUJBUUFBQUFFQkFRVUZCUU1EQXdVRkJRQUFBR0dBQWdJQ0FBQUFCQVFFQWdJQ0FBQUFCQVFFQVFFQkFBQUFBQUFBQXdNREJRVUZBZ0lDQkFRRUF3TURCUVVGQVFFQkFRRUJCUVVGQWdJQ0F3TURBQUFBQVFFQkFBQUFBUUVCQXdNREFRRUJBQUFBQVFFQkJRVUZBd01EQlFVRkFBQUFZWUFDQWdJQUFBQUVCQVFDQWdJQUFBQUVCQVFCQVFFQUFBQUFBQUFEQXdNRkJRVUNBZ0lFQkFRREF3TUZCUVVCQVFFQkFRRUZCUVVDQWdJREF3TUFBQUFCQVFFQUFBQUJBUUVEQXdNQkFRRUFBQUFCQVFFRkJRVURBd01GQlFVQUFBQUJnUUE3In0=';

    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployPixelsFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();
        const PixelArt = await ethers.getContractFactory("PixelArt");
        const contract = await PixelArt.deploy("1024 Pixels", "1KP");
        return contract;
    }

    describe("Deployment", function () {
        it("Should mint ok", async function () {
            const contract = await loadFixture(deployPixelsFixture);
            await contract.mint(PIXELS);
            expect(await contract.imageURI(TOKEN_ID)).to.equals(DATA_IMAGE);
            expect(await contract.tokenURI(TOKEN_ID)).to.equals(DATA_JSON);
        });

        it("Should mint failed: invalid color", async function () {
            const contract = await loadFixture(deployPixelsFixture);
            await expect(contract.mint('0x30' + PIXELS.substring(4))).to.be.revertedWith('invalid pixel index color');
        });

        it("Should mint failed: invalid length", async function () {
            const contract = await loadFixture(deployPixelsFixture);
            await expect(contract.mint('0x01020304')).to.be.revertedWith('invalid pixels length');
        });

        it("Should mint failed: already minted", async function () {
            const contract = await loadFixture(deployPixelsFixture);
            await contract.mint(PIXELS);
            await expect(contract.mint(PIXELS)).to.be.revertedWith('ERC721: token already minted');
        });
    });
});
