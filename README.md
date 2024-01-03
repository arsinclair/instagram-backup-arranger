A small tool that consumes an Instagram backup and produces media files from Stories named chronologically.

Requires the following tools pre-installed:
- [imagemagick](https://imagemagick.org/index.php) for transforming `.webp` images to `.jpg`;
- [libmagic](https://man7.org/linux/man-pages/man3/magic_list.3.html) to determine the file types for files without extensions.

### Several quirks of Stories in Instagram Backups

- Sometimes the file won't have an extension, only the name. So far, only observed with .mp4 videos;
- Some images are exported in .webp format and some in .jpg; it's not consistent;
- Some Media URIs in the _stories.json_ won't point to a local file, but instead to a remote instagram CDN. When tried accessing such remote file, the Instagram CDN would return a 403 error indicating that a hash has expired. Such stories are also not displayed correctly in the Story Archive of the official Instagram app. The most likely cause for this seems to be a case when the story is a repost of a reel that has since been taken down;
- the textual content is encoded in latin1 on the server, but the JSON returned is utf-8 and they don't do a proper conversion, so any textual content we have to decode back to latin1, then properly encode it to utf-8.