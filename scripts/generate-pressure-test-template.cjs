const fs = require("fs");
const path = require("path");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

const projectRoot = process.argv[2] || "D:\\DEV\\PROJECTS\\LawAidAI";
const outDir = path.join(projectRoot, "records", "friction", "templates");
ensureDir(outDir);

const markdown = `# LawAidAI Controlled Self Pressure Test Template

## Session Metadata
- Date:
- Matter / Project:
- Active Project ID:
- Operator:
- Entry Path Used:
- Current Active Artifact State:

## Pressure Test Areas
### 1. Live Intake
- What came in?
- Was intake clear?
- What was too manual?

### 2. Review + Shell Boundary
- Was reviewed state visible?
- Was shell state understandable?
- Where was confusion introduced?

### 3. Activation
- Did activation feel safe?
- Was it obvious what counted as truth?
- Did any false state appear in UI?

### 4. Continuity
- Could you recover context quickly?
- Did timeline / document continuity hold?
- What had to be reconstructed manually?

### 5. Friction Notes
- Structural issues:
- Workflow issues:
- Missing artifacts:
- Visibility issues:
- Manual safety requirements:
- Retrieval weaknesses:
- Operator burden points:

## Final Summary
- What broke?
- What slowed down?
- What should be automated?
- What must stay manual?
- What becomes the next refinement target?
`;

const outPath = path.join(outDir, "step9-controlled-self-pressure-test-template.md");
fs.writeFileSync(outPath, markdown, "utf8");

console.log(`Pressure-test template written to: ${outPath}`);