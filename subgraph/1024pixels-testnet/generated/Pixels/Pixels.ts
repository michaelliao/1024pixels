// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
    ethereum,
    Bytes,
    Address,
    BigInt
} from "@graphprotocol/graph-ts";

export class Transfer extends ethereum.Event {
    get params(): Transfer__Params {
        return new Transfer__Params(this);
    }
}

export class Transfer__Params {
    _event: Transfer;

    constructor(event: Transfer) {
        this._event = event;
    }

    get from(): Address {
        return this._event.parameters[0].value.toAddress();
    }

    get to(): Address {
        return this._event.parameters[1].value.toAddress();
    }

    get tokenId(): BigInt {
        return this._event.parameters[2].value.toBigInt();
    }
}

export class Pixels extends ethereum.SmartContract {
    static bind(address: Address): Pixels {
        return new Pixels("Pixels", address);
    }

    imageURI(tokenId: BigInt): string {
        let result = super.call("imageURI", "imageURI(uint256):(string)", [
            ethereum.Value.fromUnsignedBigInt(tokenId)
        ]);

        return result[0].toString();
    }

    try_imageURI(tokenId: BigInt): ethereum.CallResult<string> {
        let result = super.tryCall("imageURI", "imageURI(uint256):(string)", [
            ethereum.Value.fromUnsignedBigInt(tokenId)
        ]);
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toString());
    }
}
