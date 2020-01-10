import RejectionError from './RejectionError';

type PromiseCallback<T> = ((value: any) => PromiseLike<T> | T) | undefined | null;

export class Chain implements Promise<any> {
  constructor(private current: any = null, private reason: any = null) {
  }

  public finally(onfinally?: (() => void) | undefined | null): this {
    if (onfinally instanceof Function) {
      onfinally();
    }
    return this;
  }

  public then<TResult = any, TReason = never>(
    onfulfilled?: PromiseCallback<TResult>,
    onrejected?: PromiseCallback<TReason>,
  ): this {
    if (this.rejected && !(onrejected instanceof Function)) {
      return this;
    }

    const [fn, arg] = this.rejected ? [onrejected, this.reason] : [onfulfilled, this.current];

    try {
      if (fn instanceof Function) {
        this.current = fn(arg);
        if (this.current instanceof Chain) {
          this.current = this.current.eject()
        }
      }
    } catch (e) {
      this.reason = e;
      this.current = null;
    }

    return this;
  }

  public with(onfulfilled?: (value: any) => void | undefined | null, onrejected?: (value: any) => void | undefined | null): this {
    if (this.rejected && onrejected instanceof Function) {
      onrejected(this.reason);
      return this;
    }

    try {
      if (onfulfilled instanceof Function) {
        onfulfilled(this.current);
      }
    }
    finally {
      // Do nothing.
    }

    return this;
  }

  public catch<TReason = never>(onrejected?: PromiseCallback<TReason>): this {
    if (this.fulfilled) {
      return this;
    }

    this.current = this.reason;
    this.reason = null;
    return this.then(onrejected)
  }

  get [Symbol.toStringTag]() {
    return 'Chain';
  }

  get fulfilled(): boolean {
    return !this.rejected;
  }

  get rejected(): boolean {
    return this.reason !== null;
  }

  /**
   * Ejects the current state of the chain.
   *
   * @returns {*} the chain resolution, if it is fulfilled.
   * @throws Error an error containing the rejection reason, if it is rejected.
   */
  public eject(): any {
    if (this.rejected) {
      throw this.reason instanceof Error ? this.reason : new RejectionError(this.reason.toString());
    }

    return this.current;
  }
}

export default (current: any = null, err: any = null) => new Chain(current, err);
