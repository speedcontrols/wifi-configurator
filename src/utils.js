
function iterateSchema_(schema, prefix, fn) {
  let result = {};

  for (let [ key, item ] of Object.entries(schema || {})) {
    if (item.type === 'object') {
      iterateSchema_(item.properties, prefix + key + '.', fn);
      continue;
    }

    fn(item, key);
  }

  return result;
}

module.exports.iterateSchema = function (config, fn) {
  iterateSchema_(config.schema.properties || config.schema, '', fn);
};

// { foo: { bar: 1 } } -> { 'bar': 1 }
module.exports.flattenObject = function flattenObject(obj) {
  let result = {};

  for (let [ key, value ] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenObject(value));
      continue;
    }

    result[key] = value;
  }

  return result;
};
