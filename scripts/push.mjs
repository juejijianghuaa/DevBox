import { execSync } from "child_process";

const args = process.argv.slice(2);
const isDeployCf = args.includes("--cf");
const cleanArgs = args.filter((a) => a !== "--cf");

const commitMsg =
  cleanArgs.join(" ").trim() ||
  `update: ${new Date().toLocaleString("zh-CN", { hour12: false })}`;

function run(command) {
  console.log(`\x1b[36m> ${command}\x1b[0m`);
  execSync(command, { stdio: "inherit" });
}

try {
  console.log("\n\x1b[33m[1/4] 正在暂存文件改动 (git add .)...\x1b[0m");
  run("git add .");

  console.log(`\n\x1b[33m[2/4] 正在提交版本: "${commitMsg}"...\x1b[0m`);
  try {
    run(`git commit -m "${commitMsg}"`);
  } catch {
    console.log("\x1b[32m✔ 工作区无新的文件更改，继续检查并推送...\x1b[0m");
  }

  console.log("\n\x1b[33m[3/4] 正在推送到 GitHub (origin/main)...\x1b[0m");
  run("git push origin main");

  if (isDeployCf) {
    console.log("\n\x1b[33m[4/4] 正在执行编译并一键发布到 Cloudflare Pages...\x1b[0m");
    run("pnpm build");
    run("npx wrangler pages functions build --outdir out");
    run("npx wrangler pages deploy out --project-name devbox --commit-dirty=true");
    console.log("\n\x1b[32m🎉 部署成功！访问地址：https://devbox-e1z.pages.dev\x1b[0m\n");
  } else {
    console.log("\n\x1b[32m🎉 GitHub 推送成功！\x1b[0m\n");
  }
} catch (err) {
  console.error("\n\x1b[31m❌ 流程中断:\x1b[0m", err.message);
  process.exit(1);
}
