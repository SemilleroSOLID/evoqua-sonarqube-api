export default class SensibleMap<K, V> extends Map<K, V> {
  getOrThrow(key: K): V {
    const value = this.get(key);
    if (typeof value === 'undefined') {
      throw new Error();
    }
    return value;
  }
}
