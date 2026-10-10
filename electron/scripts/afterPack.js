// electron-builder afterPack hook: ensure packaged files are world-readable.
// Without this, the build environment's umask can produce restrictive modes
// (e.g. drwxrwx--- on /opt/navi-radio), breaking the installed app for users.
const { execSync } = require('child_process');

exports.default = async function (context) {
  const dir = context.appOutDir;
  execSync(`chmod -R a+rX "${dir}"`);
  console.log(`[afterPack] fixed permissions under ${dir}`);
};
