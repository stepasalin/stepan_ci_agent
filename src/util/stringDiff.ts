export function stringDiff(str1: String, str2: String) {
  let diff = '';
  str2.split('').forEach(function (val, i) {
    if (val != str1.charAt(i)) diff += val;
  });
  return diff;
}
