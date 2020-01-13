import RejectionError from './RejectionError';

type PromiseCallback<T> = ((value: any) => PromiseLike<T> | T) | undefined | null;

const isThenable = (x: any) => (x.then instanceof Function);

export class Chain implements Promise<any> {
  constructor(private value: any = null, private rejected: boolean = false) {
  }

  get isFulfilled(): boolean {
    return !this.isRejected;
  }

  get isRejected(): boolean {
    return this.rejected;
  }

  public then<TResult = any, TReason = never>(onfulfilled?: PromiseCallback<TResult>, onrejected?: PromiseCallback<TReason>): this {
    if (this.isRejected) {
      if (onrejected) {
        this.rejected = false;
        this.value = onrejected(this.value);
      }
      return this;
    }

    if (!onfulfilled) {
      return this;
    }

    let fn: ((v: any) => TResult | PromiseLike<TResult | TReason>) = onfulfilled;
    if (isThenable(this.value)) {
      fn = (p: Promise<any>) => p.then(onfulfilled, onrejected);
    }

    try {
      this.value = fn(this.value);
    } catch (e) {
      this.value = e;
      this.rejected = true;
    }

    return this;
  }

  get [Symbol.toStringTag]() {
    return 'Chain';
  }

  public catch<TReason = never>(onrejected?: PromiseCallback<TReason>): this {
    if (this.isFulfilled) {
      return this;
    }

    return this.then(null, onrejected);
  }

  public finally(onfinally?: (() => void) | undefined | null): this {
    if (onfinally) {
      onfinally();
    }
    return this;
  }

  public with(onfulfilled?: (value: any) => void | undefined | null, onrejected?: (value: any) => void | undefined | null): this {
    return this.then(onfulfilled && (value => {
      onfulfilled(value);
      return value;
    }), onrejected && (value => {
      onrejected(value);
      return value;
    }));
  }

  /**
   * Ejects the current state of the chain.
   *
   * @returns {*} the chain resolution, if it is fulfilled.
   * @throws Error an error containing the rejection reason, if it is rejected.
   */
  public eject(): any {
    if (this.isRejected) {
      throw this.value instanceof Error ? this.value : new RejectionError(this.value.toString());
    }

    return this.value;
  }
}

const chain = (current: any = null, rejected: boolean = false) => new Chain(current, rejected);
export const resolve = (value: any) => chain(value);
export const reject = (reason: any) => chain(reason, true);

export default chain;
