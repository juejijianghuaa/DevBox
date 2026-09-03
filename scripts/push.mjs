import { execSync } from "child_process";

// 获取用户传入的提交说明，未传入则默认以当前时间为说明
const commitMsg =
  process.argv.slice(2).join(" ").trim() ||
  `update: ${new Date().toLocaleString("zh-CN", { hour12: false })}`;

function run(command) {
  console.log(`\x1b[36m> ${command}\x1b[0m`);
  execSync(command, { stdio: "inherit" });
}

try {
  console.log("\n\x1b[33m[1/3] 正在暂存文件改动 (git add .)...\x1b[0m");
  run("git add .");

  console.log(`\n\x1b[33m[2/3] 正在提交版本: "${commitMsg}"...\x1b[0m`);
  try {
    run(`git commit -m "${commitMsg}"`);
  } catch {
    console.log("\x1b[32m✔ 工作区无新的文件更改，继续检查并推送...\x1b[0m");
  }

  console.log("\n\x1b[33m[3/3] 正在推送到 GitHub (origin/main)...\x1b[0m");
  run("git push origin main");

  console.log("\n\x1b[32m🎉 推送成功！已触发远程自动构建与部署！\x1b[0m\n");
} catch (err) {
  console.error("\n\x1b[31m❌ 推送中断:\x1b[0m", err.message);
  process.exit(1);
}
