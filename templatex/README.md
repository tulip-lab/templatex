
[TULIP Lab](http://www.tulip.org.au) LaTeX Template
==================

`TempLaTeX` is the `LaTeX` package used in TULIP Lab for paper drafting. You are expected to use `git` to host the repository, and use `git-flow` to manage the collaborative writing platform for academic paper authoring.

---
## I. Required Packages
---

You are expected to be familiar with `LaTeX`, if not, you need learn it from [WikiBook](https://en.wikibooks.org/wiki/LaTeX).

We recommend the following packages for cross platform writing:

* [TeXLive!](https://tug.org/texlive/) 
* [Visual Studio Code](https://code.visualstudio.com/): with extensions such as `LaTeX Workshop`, `Markdown All in One`, etc.
* [SmartGit](https://www.syntevo.com/smartgit/)
* [LaTeXDiff](https://www.ctan.org/pkg/latexdiff?lang=en) and [Git-LaTeXDiff](https://gitlab.com/git-latexdiff/git-latexdiff)
* [Bitbucket](http://bitbucket.org) or [GitHub](https://github.com/)
* CTeX Packages
  1. [powerdot-tuliplab](https://ctan.org/pkg/powerdot-tuliplab)
  2. [tikz poster](https://ctan.org/pkg/tikzposter?lang=en)
  3. [e-TEX](https://ctan.org/pkg/etex?lang=en)

---
## II. Setup the Repository
---

1. Create one new repository in your `git` platform. You may create a set of folders including 
`Code` with your source code, `Data` with your experiment data, `Report` with all the files in this package. 

1. Open the `preamble.tex`, and update with your own information at the following places:

    Line 32: 

    ```latex
    \newcommand{\qwu}[1]{\draftnote{darkgreen}{[QWu: #1]}}
    % other colors include blue, red, purple, cyan, darkgreen, etc.
    ```
    by something  such as:

    ```latex
    \newcommand{\yourname}[1]{\draftnote{blue}{[You: #1]}}
    % other colors include blue, red, purple, cyan, darkgreen, etc.
    ```

    Do the same change for the block like:
    ```latex
    \newcommand{\qwuMarker}
	{\todo[author=QWu,size=\tiny,inline,color=red!40]
	{Qiong Wu has worked up to here.}}
    ```

    Fill the proper information for the following block:
    ```latex
    \hypersetup
    {
        pdfauthor={\gitAuthorName},
        pdfsubject={TULIP Lab},
        pdftitle={},
        pdfkeywords={TULIP Lab, Data Science},
        bookmarks=true,  
    }
    ```

3. The following templates for conference or report are provided:
    - `report.tex`: the complete report stem file;
    - `report-htm.tex`: the complete report stem file for tourism and hospitality paper;
    - `report-acm.tex`: the stem file for ACM conference proceedings;
    - `report-ieee.tex`: the stem file for IEEE conference proceedings;
    - `report-lncs.tex`: the stem file for Springer LNCS conference proceedings;
    - `slides.tex`: one sample file for slides with notes;
    - `poster.tex`: one sample file for poster. 
    

4. Customize the bib file names:
    - no need to change file names such as `report.tex` etc.
    - add or replace `yourbib.bib` with your research `bib` file.


5. Check out the repository to local drive, and set up the local environment for `gitinfo2` package:

    - This package contains a `gitinfo` folder with three executive `bash` `shell` scripts:
        *  `post-checkout`
        *  `post-commit`
        *  `post-merge`

    -  Copy or move these three files into your repository's `.git/hooks` folder. 
        -  For example, if the root of your local repositories is `~/MyFancyPaper`, then you can copy/move above three files to `~/MyFancyPaper/.git/hooks/`.

    - Test Run: check out or pull your repository, and it should generate/update the file `./git/gitHeadInfo.gin` in your local repository.
        - For example: check `~/MyFancyPaper/.git/gitHeadInfo.gin`.

    - Compile the main LaTeX file, and view the PDF.

6. Happy LaTeXing!

## III. Rules for Collaborative LaTeXing
---

You MUST follow the following rules when writing collaboratively. Otherwise, your co-author will find it impossible to work together.

### III.A. LaTeX Source Code

1. Avoid **ineffective** modifications.

1. Do not change line breaks without good reason.

1. Turn off automatic line wrapping of your LaTeX editor.

1. Start each new sentence in a new line.

1. Split long sentences into several lines so that each line has at most `80` characters.

1. For all the marginal comments by other co-authors, you MUST responed to them using a responsive marginal comment, such as

    ```latex
    \gangli{What is wrong here?}
    \qwu{This is my response ...}
    ```

1. If your comment has been properly addressed by co-authors, you **MUST** remove or comment out both the *original* and the *response* marginal comments.

1. You can use something similar to the following code to indicate where you are updating up to:

    ```latex
    \gliMarker %TODO: GLi up to here!
    ```

### III. B. Repository

1. Put only those files that are directly modified by the user under version control.

1. Verify that your code can be compiled flawlessly before - committing your modifications to the repository.

1. Use `git-latexdiff` or `latediff` (or `git` compare tools) to critically review your modifications before committing them to the repository.

1. Add a meaningful and descriptive comment when committing your modifications to the repository.

1. Use the `git` client for copying, moving, or renaming files and folders that are under revision control.

1. Use `git-flow` scheme to create `feature`, `branch`, `release` and `version` of your paper. Be really careful when you are touching `develop` or `master` branch.










