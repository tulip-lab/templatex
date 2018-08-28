
`Powerdot` [TULIP Lab](http://www.tulip.org.au) Style Package 
==================

* Licenses: [The LATEX Project Public Li­cense](https://www.ctan.org/license/lppl1.3)
* CTAN: https://www.ctan.org/pkg/powerdot-tuliplab

`powerdot-tuliplab` is the latex package used in TULIP Lab for presentation drafting. It comes with several sample `tex` files so that you can quickly start working with it. 

If you are creating a presentation using this package, you are recommended to use `git` to host the repository, and use `git-flow` to manage the collaborative writing platform for academic presentation authoring.



---
## I. Required Packages
---

You should be familiar with `LaTeX`, if not, you need learn it from [WikiBook](https://en.wikibooks.org/wiki/LaTeX).

We recommend the following packages for cross platform writing:

* [TeXLive!](https://tug.org/texlive/) with `powerdot` package
* [SmartGit](https://www.syntevo.com/smartgit/)
* [Bitbucket](http://bitbucket.org) or [GitHub](https://github.com/)

---
## II. Contained Files
---

This package contains the following files

1. `powerdot-tuliplab.sty`	TULIP-Lab Style File
2. `tuliplab-P00.tex`       A Simple Presentation Sample with Transitions
3. `tuliplab-P01.tex`       One Academic Presentation Sample with References List
4. `tuliplab-P03.tex`       One Sample file with PSTrick figures.
5. `logos/tulip`		        Folder of images for slides graphics. 

You can use replace `logos/tulip.eps`, `logos/tulip-wordmark.eps` with your favorite images. Four alternatives are also provided in the folder for top left picture, two banner options provided.

---
## III. Package Installation
---

Typically this package should be installed automatically with a full `LaTeX` package, or you can install directly from `ctan.org`. If this doesn't work, try the following steps.

1. Copy files the whole folder `powerdot-tuliplab` with file `powerdot-tuliplab.sty` and folder `logos` folders to your home directory under `~/texmf/tex/latex/powerdot-tuliplab`; for `macOS`, please put it under `/usr/local/texlive/texmf-local/tex/latex`

2. Refresh `TexLive` by typing the following command:

```shell
cd
sudo texhash
```

For `Mktex` on `Windows`, you can run `mktexlsr`
  
3. For compiling, you should use the chain operators `LaTeX -> DVI`, and then `DVI -> PS`, finally `PS -> PDF`.


---
## IV. Setup the Repository for Your Own Presentation Slides
---

Those examples provided in this package can be used as the template, and I recommend you create a new repository in your `git` platform, initialized with one sample `tex` file in this package.

1. Customize the file name:
    - change `tuliplab-P0X.tex` into a suitable file name


1. Check out the repository to local drive, and set up the local environment for `gitinfo2` package:


    - Download/copy those files from `https://github.com/tulip-lab/templatex/tree/develop/templatex/gitinfo`, which is the `gitinfo` folder with three executive `bash` `shell` scripts:
        *  `post-checkout`
        *  `post-commit`
        *  `post-merge`

    -  Copy or move these three files into your repository's `.git/hooks` folder. 
        -  For example, if the root of your local repositories is `~/MyFancySlides`, then you can copy/move above three files to `~/MyFancySlides/.git/hooks/`.

    - Test Run: check out or pull your repository, and it should generate/update the file `./git/gitHeadInfo.gin` in your local repository.
        - For example: check `~/MyFancySlides/.git/gitHeadInfo.gin`.

    - Compile the main `LaTeX` file, and view the `PDF`.

1. Happy LaTeXing!

## V. Rules for Collaborative LaTeXing
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


1. You can use the following code to indicate where you are updating up to:

    ```latex
    \HRule %TODO: YourName up to here!
    ```

### III. B. Repository

1. Put only those files that are directly modified by the user under version control.

1. Verify that your code can be compiled flawlessly before - committing your modifications to the repository.

1. Use `git-latexdiff` or `latediff` (or `git` compare tools) to critically review your modifications before committing them to the repository.

1. Add a meaningful and descriptive comment when committing your modifications to the repository.

1. Use the `git` client for copying, moving, or renaming files and folders that are under revision control.

1. Use `git-flow` scheme to create `feature`, `branch`, `release` and `version` of your paper. Be really careful when you are touching `develop` or `master` branch.




