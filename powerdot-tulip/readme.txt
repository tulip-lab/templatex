%% 
%% ---------------------------------------------------------------
%% Copyright (C) 2012, 2015 Gang Li
%% ---------------------------------------------------------------
%%
%% This work is a modification of the default powerdot style and may be
%% distributed and/or modified under the conditions of the LaTeX Project Public
%% License, either version 1.3 of this license or (at your option) any later
%% version. The latest version of this license is in
%% http://www.latex-project.org/lppl.txt and version 1.3 or later is part of all
%% distributions of LaTeX version 2003/12/01 or later.
%%
%% This work has the LPPL maintenance status "maintained".
%%
%% Current Maintainer of this work is Gang Li.
%%
%% {$HeadURL: svn://cloud.tulip.org.au/WAEERepository/presentation/powerdot-tulip/trunk/readme.txt $}
%% {$LastChangedDate: 2015-12-02 19:45:14 +0800 (Wed, 02 Dec 2015) $}
%% {$LastChangedRevision: 208 $}
%% {$LastChangedBy: gangli $}
%%


Files:

1. powerdot-tulip.sty	Style File

2. powerdot-tulip.tex 	Initial Test File

3. powerdot-template.tex Initial template file

4. pstricks-tulip.tex	PSTricks sample File

5. logos/tulip		Folder for top left picture,
you can use your favoriate file to replace logos/tulip.eps, logos/tulip-wordmark.eps
four options provided for top left picture, 
two banner options provided.

This is the style file for Powerdot in TULIP Lab.

For installation:

1. Copy files powerdot-tulip.tex, powerdot-tulip.sty and logos folders to 
your home directory under ~/texmf/tex/latex/powerdot-tulip; for Mac OS X, 
please put it under ~/Library/texmf/tex/latex/powerdot-tulip.

2. Refresh TexLive by typing the following command:

  cd
  texhash ~/texmf

  Mktex run mktexlsr
  
If you are using Windows/MkTex, please find the method and inform me to update.

3. Use the powerdot-tulip.tex as an example for your own slides.

4. Errors report back to Gang Li.

5. For compiling, you should use Latex -> DVI, and then DVI->PS,
finally PS->PDF.

For Template:

1. The example in this package can be used as a template,
but another separate package is specifically created as the template.

2. If you find some new tricks,
Please feel free to add into the powerdot-tulip.tex file,
and send the file back to me.

