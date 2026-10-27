# Jordsjuk website

Static website with Pages CMS collections for concerts, news and releases.

## Local preview

Install Python 3.10+ and Pillow (`python3 -m pip install Pillow`), then run:

```
python3 scripts/build.py --preview
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000. After editing content locally, rerun the build command.

## GitHub launch

1. Push this directory as the repository root, on `main`.
2. In GitHub Settings → Pages, select **GitHub Actions** as the source.
3. Run **Publish website**, or push a change. It builds the static site and deploys `dist/`.
4. Sign into https://app.pagescms.org with the repository owner and authorize access only to this repository. Pages CMS reads `.pages.yml` at its root.
5. Invite the band's editor through Pages CMS. Do not share account passwords.
6. Test one draft, image upload and publication before giving the customer the editor link.
7. Connect the existing domain only after review. Its domain and DNS provider still need to be confirmed. Preserve email DNS records. No domain is configured in this project yet.

GitHub repository creation, Pages activation, Pages CMS authorization and customer invitations require connected accounts; local configuration alone does not activate them. Repository visibility and ownership must be confirmed before publication.

## Editing guide

Open **Concerts**, **News**, or **Releases** in Pages CMS, choose an entry or Add, and fill in the form. Upload images in the picture field; add a description for accessibility. Plain-text body fields support paragraphs separated by blank lines.

Turn on **Show on website** and save when ready. Saving triggers the GitHub publishing workflow. Leave it off to keep an entry as a draft. Each editor needs their own invitation.

- Concerts sort by event date. Past concerts move to the archive automatically using the Oslo calendar date; statuses include On sale, Sold out and Cancelled. Ticket links are optional.
- Future-dated news remains hidden until that date; the scheduled workflow rebuilds daily. The homepage checks the date on every page load too.
- Releases use Display order, smallest first. The existing releases only have a confirmed year; their optional full release dates are left blank.
- Existing news entries retain links to their Framer articles because their full article text has not yet been supplied. New articles open on the local site.

## Pictures and builds

Uploads are stored in `media/uploads` and remain original in GitHub. The build corrects orientation, strips metadata, caps dimensions at 1800px and converts them to quality-85 WebP. Only optimized pictures are published; drafts and source uploads are excluded from `dist/`. Original uploads still count toward repository storage, so upload web-sized pictures rather than huge master files. Existing design assets are already optimized and copied unchanged, preserving masks and transparency.

The homepage displays the first five upcoming concerts, two newest news entries and three releases. Full lists and detail pages use `content.html`. Contact still links to Framer; merch and social links remain external. CMS text is escaped before rendering and outbound URL schemes are restricted to HTTP(S).

No subscription, domain changes or paid services were enabled by preparing these files.
