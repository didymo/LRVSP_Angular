export class DefaultableMap<Key, Value> extends Map<Key, Value> {
  public getOrSetDefault(key: Key, defaultValue: Value): Value {
    if (!this.has(key)) {
      this.set(key, defaultValue)
    }
    return this.get(key)!
  }

  public getOrSetDefaultDefer(key: Key, defaultValueFunc: () => Value) {
    if (!this.has(key)) {
      this.set(key, defaultValueFunc())
    }
    return this.get(key)!
  }
}
