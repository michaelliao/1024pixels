import {
  log,
  ethereum,
  store,
  Bytes,
  Address,
  BigInt,
  Entity,
  Value,
  ValueKind
} from "@graphprotocol/graph-ts";

import {
  Pixels,
  Transfer as TransferEvent
} from "../generated/Pixels/Pixels"

import {
  Transfer
} from "../generated/schema"


export class NFT extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save NFT entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type NFT must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("NFT", id.toString(), this);
    }
  }

  static load(id: string): NFT | null {
    return changetype<NFT | null>(store.get("NFT", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get creator(): Bytes {
    let value = this.get("creator");
    return value!.toBytes();
  }

  set creator(value: Bytes) {
    this.set("creator", Value.fromBytes(value));
  }

  get owner(): Bytes {
    let value = this.get("owner");
    return value!.toBytes();
  }

  set owner(value: Bytes) {
    this.set("owner", Value.fromBytes(value));
  }

  get image(): string {
    let value = this.get("image");
    return value!.toString();
  }

  set image(value: string) {
    this.set("image", Value.fromString(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    return value!.toBigInt();
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get blockTimestamp(): BigInt {
    let value = this.get("blockTimestamp");
    return value!.toBigInt();
  }

  set blockTimestamp(value: BigInt) {
    this.set("blockTimestamp", Value.fromBigInt(value));
  }

  get transactionHash(): Bytes {
    let value = this.get("transactionHash");
    return value!.toBytes();
  }

  set transactionHash(value: Bytes) {
    this.set("transactionHash", Value.fromBytes(value));
  }
}

export function handleTransfer(event: TransferEvent): void {
  if (event.params.from.equals(Address.zero())) {
    let tokenId = event.params.tokenId;
    log.debug('mint token: {}', [tokenId.toString()]);

    let contract = Pixels.bind(event.address);
    let image = contract.imageURI(tokenId);
    log.debug('get image: {}', [image.substring(0, 64)]);

    let nft = new NFT(tokenId.toString());
    nft.creator = event.params.to;
    nft.owner = event.params.to;
    nft.image = image;

    nft.blockNumber = event.block.number;
    nft.blockTimestamp = event.block.timestamp;
    nft.transactionHash = event.transaction.hash;

    nft.save();
  } else {
    let tokenId = event.params.tokenId;
    log.debug('transfer token: {}', [tokenId.toString()]);
    let nft = NFT.load(tokenId.toString());
    if (nft === null) {
      log.error('failed load NFT by token: {}', [tokenId.toString()]);
    } else {
      nft.owner = event.params.to;
      nft.save();
    }
  }

  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from;
  entity.to = event.params.to;
  entity.tokenId = event.params.tokenId;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
