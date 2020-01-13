# Ten Plates Templates [WIP]
[![Binder](http://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/alexmorley/ten-plates-live/master?urlpath=lab/tree/index.ipynb)

## Create Jupyter Notebooks in Jupyter Lab from templates


This is currently in very early development. If you want a solution that is more fully developed check out @timkpaine's [JupyterLab Templates](https://github.com/timkpaine/jupyterlab_templates).
You can try it out on Binder (see link at the top).

If your happy to be a tester/things to break then carry on! You'll get a bunch of features like:

- Creating a notebook from a mustache template (parameterized templates!).
- Sourcing templates from a local or remote server (you can ddd new templating servers from friends/communities).
- Front-end only (OK this isn't a feature but means we don't have to install any python packages that can run arbitrary code on your machine).

## How To
### Install


### Create a new notebook from a template

In JupyterLab:
`File > New > From Templates > Notebook`

<small>NB: This extension is not compatible with classic jupyter.</small>

### Add or enable/disable a new template source

`Settings > Template Settings > Add / Toggle`

### Create your own template source

Template source servers must have two endpoints:

`/info/{filetype}`  
Returns a json describing each template with that filetype as a key. `paths` are relative to the base\_url:

```json
{
  "markdown": {
    "pretty_name": "markdown",
    "path": "templates/markdown/markdown.md",
    "parameters": [
      {
        "name": "Jealousy",
        "default": "no"
      }
    ]
  },
  "python-readme": {
    "pretty_name": "python-readme",
    "...": "..."
  }
}
```

See [Notebook Templates](https://github.com/alexmorley/notebook_templates) for an example.


## Next Up

### Additional Source Support
- View status of a source
- Upload/use a local template without a server
- Persist source config in settings
- Proper Dialog error when no sources can be found or file is not retrievable.

### Cell templates
- Flesh out potential interfaces.
- User research / testing
- Mimic Static DB structure of full files for cells

### More Examples
- Make nicer examples of notebook templates.
- Make lots of examples of potentially useful cells.

### Nicities
- Make the MustacheEngine a bit more type strict.

