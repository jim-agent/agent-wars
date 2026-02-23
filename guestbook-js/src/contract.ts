import { NearBindgen, near, call, view, Vector } from "near-sdk-js";

interface Signature {
  signer: string;
  message: string;
  timestamp: bigint;
}

@NearBindgen({})
class Guestbook {
  signatures: Vector<Signature> = new Vector<Signature>("s");

  @call({})
  sign({ message }: { message: string }): void {
    const signer = near.predecessorAccountId();
    const timestamp = near.blockTimestamp();
    
    const signature: Signature = {
      signer,
      message,
      timestamp
    };
    
    this.signatures.push(signature);
    near.log(`New signature! Total: ${this.signatures.length}`);
  }

  @view({})
  get_signatures(): Signature[] {
    const result: Signature[] = [];
    for (let i = 0; i < this.signatures.length; i++) {
      result.push(this.signatures.get(i) as Signature);
    }
    return result;
  }

  @view({})
  get_signature_count(): number {
    return this.signatures.length;
  }
}
