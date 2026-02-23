# Coordination Protocol: Claude ↔ Gemini (Antigravity)

This document defines the coordination protocol between Claude Code and Gemini (Antigravity agent) for the NB_Apps project.

## Agent Responsibilities

### Claude (Development Agent)
**Primary Functions**:
- Interactive development (writing, editing, reviewing code)
- Debugging and troubleshooting
- Documentation creation and maintenance
- Architectural decisions and design
- Code reviews and quality assurance
- Complex problem-solving
- Learning from project history

**Tools**: All Claude Code tools (Read, Write, Edit, Bash, Grep, Glob, etc.)

**Working Hours**: On-demand, user-initiated

---

### Gemini (Automation Agent - Antigravity)
**Primary Functions**:
- Automated workflow execution
- Bulk NocoBase configuration
- Data seeding and migration
- Repetitive API operations
- Specification-driven automation
- Audit and validation

**Tools**: Defined in `.agent/` configuration

**Working Hours**: Scheduled or triggered by Claude/user

---

## Handoff Strategy

### Context-Based Handoff

Determine which agent should handle the task based on:

| Characteristic | Claude | Gemini |
|---------------|--------|--------|
| **Interactivity** | High | Low |
| **Complexity** | High | Medium to Low |
| **Repetition** | Low | High |
| **Creativity Required** | High | Low |
| **Specification-Driven** | No | Yes |
| **User Input Needed** | Frequent | Minimal |

### Decision Tree

```
Task Request
    │
    ├─ Is it a defined workflow? ────────────> YES ──> Gemini
    │                                           │
    │                                           NO
    │                                           │
    ├─ Does it require creative problem-solving? ──> YES ──> Claude
    │                                           │
    │                                           NO
    │                                           │
    ├─ Is it repetitive/bulk operation? ──────> YES ──> Gemini
    │                                           │
    │                                           NO
    │                                           │
    ├─ Does it require debugging? ────────────> YES ──> Claude
    │                                           │
    │                                           NO
    │                                           │
    └─ Is it specification-driven? ───────────> YES ──> Gemini
                                                │
                                                NO
                                                │
                                               Claude (default)
```

---

## Common Scenarios

### Scenario 1: Configure NocoBase Collections

**User Request**: "Configure NocoBase with the collections defined in app-spec/app.yaml"

**Decision**: Gemini (Automation)

**Workflow**:
1. Claude reviews `app-spec/app.yaml` to understand requirements
2. Claude validates specification format
3. Claude hands off to Gemini: Suggest running `/nocobase-configure` workflow
4. Gemini executes automated configuration
5. Claude verifies results and updates documentation

---

### Scenario 2: Debug API Connection Issue

**User Request**: "The API is returning 0 collections"

**Decision**: Claude (Debugging)

**Workflow**:
1. Claude investigates using diagnostic scripts
2. Claude checks logs: `.claude/logs/errors-*.log`
3. Claude consults memory: `common_issues.json`
4. Claude identifies root cause (e.g., legacy script bug)
5. Claude provides solution and updates documentation
6. No Gemini handoff needed

---

### Scenario 3: Seed Reference Data

**User Request**: "Load all reference data from dictionaries"

**Decision**: Gemini (Bulk Operation) with Claude oversight

**Workflow**:
1. Claude analyzes dictionaries in `Apps/UGCO/BD/diccionarios_raw/`
2. Claude validates data format
3. Claude suggests: Use `/nocobase-seed` workflow
4. Gemini executes seeding
5. Claude verifies data integrity
6. Claude updates documentation

---

### Scenario 4: Refactor Code

**User Request**: "Refactor the authentication module to use TypeScript"

**Decision**: Claude (Development)

**Workflow**:
1. Claude analyzes current code structure
2. Claude plans refactoring approach
3. Claude implements changes incrementally
4. Claude tests and verifies
5. Claude updates documentation
6. No Gemini handoff (creative development task)

---

### Scenario 5: Create New Feature

**User Request**: "Add a new feature for tracking patient appointments"

**Decision**: Collaborative (Both agents)

**Workflow**:
1. **Claude** (Design phase):
   - Gather requirements
   - Design data model
   - Create specification in `app-spec/app.yaml`
   - Design UI/UX

2. **Handoff to Gemini** (Implementation):
   - Configure collections via `/nocobase-configure`
   - Set up UI via `/nocobase-configure-ui`
   - Seed reference data via `/nocobase-seed`

3. **Back to Claude** (Finalization):
   - Test functionality
   - Create custom scripts if needed
   - Write documentation
   - Code review

---

## Handoff Communication

### When Claude Hands Off to Gemini

**Format**:
```markdown
## Handoff to Gemini

**Task**: Configure UGCO collections
**Workflow**: /nocobase-configure
**Context**:
- Specification: app-spec/app.yaml
- Collections to create: 10 (onco_casos, onco_episodios, etc.)
- Current state: 0 collections exist

**Expected Outcome**: All collections created with proper fields and relationships

**Verification**: Run `npm run ugco:list` to verify

**Next Steps**:
1. Gemini executes configuration
2. Claude verifies results
3. Claude updates documentation
```

### When Gemini Hands Back to Claude

**Format**:
```markdown
## Handoff from Gemini

**Task Completed**: NocoBase configuration
**Status**: Success
**Collections Created**: 10
**Errors**: 0

**Context Preserved**:
- Configuration log: .claude/logs/tasks-20260125.log
- API calls made: 47
- Duration: 3m 24s

**Pending Tasks**:
- Verify data integrity
- Update documentation
- Create usage examples

**Recommended Next Action**: Verify configuration and document changes
```

---

## State Management

### Shared Context Files

Both agents use these files for state sharing:

1. **`.claude/memory/last_context.json`**
   - Last task completed
   - Pending actions
   - Current state

2. **`.claude/memory/project_knowledge.json`**
   - Accumulated project knowledge
   - Key decisions
   - Architecture notes

3. **`.claude/logs/`**
   - Task logs
   - API call logs
   - Error logs
   - File change logs

### State Synchronization

- Claude writes to memory after completing tasks
- Gemini reads memory before starting workflows
- Both update `project_knowledge.json` with learnings
- Logs are append-only for auditability

---

## Conflict Resolution

If both agents are asked to work on the same task:

1. **User Clarification**: Ask user which agent should handle it
2. **Default to Claude**: If interactive or complex
3. **Default to Gemini**: If automated and specification-driven
4. **Collaborate**: If task has both creative and repetitive aspects

---

## Emergency Handoff

In case of errors or blocking issues:

**Gemini → Claude**:
```
Error encountered during automation.
Handing off to Claude for manual investigation.
Error details: [error_context]
```

**Claude → User**:
```
Automation encountered an issue.
Recommend manual review or different approach.
```

---

## Performance Optimization

### Minimize Handoffs
- Complete related tasks in one agent session
- Batch operations before handing off
- Don't ping-pong between agents unnecessarily

### Maximize Efficiency
- Claude: Focus on tasks requiring creativity/judgment
- Gemini: Focus on repetitive, specification-driven tasks
- Both: Update shared context to avoid redundant work

---

## Examples

### Good Handoff (Efficient)
```
User: "Set up UGCO application"
Claude:
1. Reviews requirements
2. Creates/validates app-spec/app.yaml
3. Suggests Gemini workflow: /nocobase-configure
4. Waits for completion
5. Verifies and documents

Result: Clean handoff, clear responsibilities
```

### Poor Handoff (Inefficient)
```
User: "Set up UGCO application"
Claude: Creates one collection manually
Gemini: Creates another collection
Claude: Creates third collection
Gemini: Creates fourth collection

Result: Inefficient, mixed responsibilities
```

---

## Monitoring

Track handoffs and coordination effectiveness:
- Number of handoffs per task
- Success rate of automated workflows
- Time saved through automation
- Quality of handoff communication

**Log Location**: `.claude/logs/coordination-*.log`

---

## Continuous Improvement

Both agents should:
1. Learn from successful handoffs
2. Document new patterns in `project_knowledge.json`
3. Update this protocol as needed
4. Share learnings to improve collaboration

---

**Last Updated**: 2026-01-25
**Maintained By**: System Administrator
**Review Frequency**: Quarterly or after major workflow changes
