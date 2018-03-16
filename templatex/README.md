

##Please configure the gitinfo package follow the below step before you work with the tulip tempaltex





**1.**First, check out your local repositories ensure that you have a git repository and working tree. For this example,let’s suppose that the root of the working tree is in ~/compsci

**2.** Copy the file post-xxx-sample.txt as post-checkout into the git hooks directory in your working copy. In our example case, you should end up with a file called ~/compsci/.git/hooks/post-checkout

**3.** With your favourite editor, edit the file you have just created. Very near the start of the file, you will see two lines:

	prefixes=”. test docs”

	prefixes=”.”

The first line is an example of how you might configure for multiple copies of gitHeadInfo.gin; the second is the default, and means “the working copy root”.

If all of your documents will be kept in the root of the working copy, you may leave this file alone. If not, you should delete the line prefixes=”.”, and edit the other line to include the paths, relative to the working copy root, where the documents that need access to gitinfo are kept.

Suppose, for example, that you have a project called ‘compsci’. Your working copy is ~/compsci with two paths containing documents, ~/compsci/docs/essays and ~/compsci/docs/reference. Then you might set up the prefixes like this:

	prefixes=”docs/essays docs/reference”

which will cause copies of the metadata to be saved in just those two directories. In this example, it will not be accessible to documents kept in the working copy’s root (designated by “.”, omitted in this case),

**4.** Test your setup with “git checkout master” (or another suitable branch
name). This should generate copies of gitHeadInfo.gin in the directories
you intended.

**5.** Now make two more copies of this file in the same directory (hooks),
calling them post-commit and post-merge, and you’re done.