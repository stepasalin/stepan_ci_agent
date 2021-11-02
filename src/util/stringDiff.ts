// TODO: this could be way more efficient
// by design, we only append logs, ergo it is possible to just
// take len of str1 and return all str2 has to offer beyond that point
// d-uh

export function stringDiff(str1: String, str2: String) {
  let diff = '';
  str2.split('').forEach(function (val, i) {
    if (val != str1.charAt(i)) diff += val;
  });
  return diff;
}
