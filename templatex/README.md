
Using [TULIP Lab](http://www.tulip.org.au) LaTeX Template
==================

`TempLaTeX` is the latex package used in TULIP Lab for paper drafting. You are expected to use `git` to host the repository, and use `git-flow` to manage the collaborative writing platform for academic paper authoring.

## 1. Required Packages
---

You are expected to be familiar with LaTeX, if not, you need learn it from [WikiBook](https://en.wikibooks.org/wiki/LaTeX).

We recommend the following packages for cross platform writing:

* [TeXLive!](https://tug.org/texlive/)
* [Visual Studio Code](https://code.visualstudio.com/): with extensions such as `LaTeX Workshop`, `Markdown All in One`, etc.
* [SmartGit](https://www.syntevo.com/smartgit/)
* [LaTeXDiff](https://www.ctan.org/pkg/latexdiff?lang=en) and [Git-LaTeXDiff](https://gitlab.com/git-latexdiff/git-latexdiff)
* [Bitbucket](http://bitbucket.org) or [GitHub](https://github.com/)


## 2. Setup the Repository
---

1. Create one new repository in your `git` platform, initialized with all the files in this package.


1. Check out to local drive, and set up the local environment for `gitinfo2` package:

    - This package contains a `gitinfo` folder with three executive `bash` `shell` scripts:
        *  `post-checkout`
        *  `post-commit`
        *  `post-merge`

    -  Copy or move these three files into your repository's `.git/hooks` folder. 
        -  For example, if the root of your local repositories is `~/MyFancyPaper`, then you can copy/move above three files to `~/MyFancyPaper/.git/hooks/`.

    - Test Run: check out or pull your repository, and it should generate/update the file `./git/gitHeadInfo.gin` in your local repository.
        - For example: check `~/MyFancyPaper/.git/gitHeadInfo.gin`.


    - Compile the main LaTeX file, and view the PDF.

1. Happy LaTeXing!

## 3. Rules for Collaborative LaTeXing
---

- Avoid **ineffective** modifications.

- Do not change line breaks without good reason.

- Turn off automatic line wrapping of your LaTeX editor.

- Start each new sentence in a new line.

- Split long sentences into several lines so that each line has at most `80` characters.

- Put only those files under version control that are directly modified by the user.

- Verify that your code can be compiled flawlessly before - committing your modifications to the repository.

- Use `git-latexdiff` or `latediff` (or `git` compare tools) to critically review your modifications before committing them to the repository.

- Add a meaningful and descriptive comment when committing your modifications to the repository.

- Use the `git` client for copying, moving, or renaming files and folders that are under revision control.










