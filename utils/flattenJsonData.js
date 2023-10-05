function flanttenJsonData(obj, prefix = '', depth = 0, maxDepth = 10) {
  let flattened = {}

  if (depth > maxDepth) {
    return { [prefix.slice(0, -1)]: obj } // Return object as-is
  }

  for (let key in obj) {
    if (typeof key !== 'string') {
      key = String(key)
    }

    if (Array.isArray(obj[key])) {
      obj[key].forEach((item, index) => {
        Object.assign(
          flattened,
          flanttenJsonData(item, `${prefix}${key}[${index}].`, depth + 1)
        )
      })
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(
        flattened,
        flanttenJsonData(obj[key], prefix + key + '.', depth + 1)
      )
    } else {
      flattened[prefix + key] = obj[key]
    }
  }

  return flattened
}

export default flanttenJsonData
