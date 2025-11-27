# Contribution Guidelines & Technical Rules

To keep our codebase clean and our production environment stable, all contributors must strictly follow these rules. 

---

## 1. Branching
We do not push directly to the `main` branch. All work must be done on isolated branches that clearly identify who is working on them.

### **Naming Convention**
You **must** include your name (or anything that can be identified as you) in the branch name so we know who owns the code.

**Format:** `your-name`

---

## 2. Local Testing
Before you open a Pull Request, you must verify the code on your own machine. We do not use the shared repository to "see if it works."

**The Pre-PR Checklist:**
1.  **Build:** Does the project compile/build without errors?
2.  **Run:** Can you run the application locally?
3.  **Test:** Have you clicked through the feature you just added to ensure it actually behaves as expected?

---

## 3. Pull Request (PR) Standards
We do not accept silent code merges. When you are ready to merge into `main`, you must open a Pull Request that explicitly states what has changed.

### **PR Description Requirements**
Your PR description must include:
* **What changed:** A bulleted list of the specific files or logic you modified.

**Example PR Description:**
> **Changes:**
> * Added a new `submit` function in `forms.js`.
> * Updated CSS for the login button color.

---

## 4. Zero-Tolerance for Force Pushes
**NEVER force push (`git push -f`) to the `main` branch.**

* Force pushing rewrites history and can delete other people's work.
* If you mess up your local history, fix it locally before pushing.