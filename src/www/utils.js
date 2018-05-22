
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

function iterateSchema(config, fn) {
  iterateSchema_(config.schema.properties || config.schema, '', fn);
}

module.exports.iterateSchema = iterateSchema;


module.exports.countSchema = function (config) {
  let cnt = 0;
  iterateSchema(config, () => cnt++);
  return cnt;
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
