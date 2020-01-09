type PromiseCallback<T> = ((value: any) => (PromiseLike<T> | T)) | undefined | null

export class Chain implements Promise<any> {
  constructor(private resolution: any = null, private reason: any = null) {}

  public finally(onfinally?: (() => void) | undefined | null): this {
    if (onfinally instanceof Function) { onfinally(); }
    return this;
  }

  public then<TResult = any, TReason = never>(onfulfilled?: PromiseCallback<TResult>, onrejected?: PromiseCallback<TReason>): this {
    if (this.rejected && onrejected instanceof Function) { return this.catch(onrejected) }

    try {
      if (onfulfilled instanceof Function) {
        this.resolution = onfulfilled(this.resolution);
      }
    } catch (e) {
      this.reason = e;
      this.resolution = null;
    }

    return this;
  }

  public catch<TReason = never>(onrejected?: PromiseCallback<TReason>): this {
    if (this.fulfilled) { return this; }

    onrejected = onrejected instanceof Function ? onrejected : x => x;

    this.resolution = onrejected(this.reason);
    this.reason = null;
    return this;
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
      throw (this.reason instanceof Error) ? this.reason : new Error(this.reason.toString());
    }

    return this.resolution;
  }
}

export default (current: any = null, err: any = null) => new Chain(current, err);
