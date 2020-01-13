import {
  ILayoutRestorer, JupyterFrontEnd, JupyterFrontEndPlugin,
} from "@jupyterlab/application";

import {
  Dialog, ICommandPalette, showDialog, showErrorMessage,
} from "@jupyterlab/apputils";

import { IDocumentManager, } from "@jupyterlab/docmanager";
import { IFileBrowserFactory, } from "@jupyterlab/filebrowser";
import { IMainMenu, } from "@jupyterlab/mainmenu";
import { Menu, } from "@phosphor/widgets";
import { MustacheEngine } from './mustache'

import {
  TemplateSourcer, StaticWebSource, Source
} from './source';

import { AddSourceWidget, } from './widgets';
import { OpenTemplate, } from './template';

import "../style/index.css";

const Mustache = new MustacheEngine();

/**
 * Initialization data for the jupyterlab_templates2 extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_templates2',
  autoStart: true,
  activate,
  requires: [IDocumentManager, ICommandPalette, ILayoutRestorer, IMainMenu, IFileBrowserFactory],
};


function activate(app: JupyterFrontEnd,
  docManager: IDocumentManager,
  palette: ICommandPalette,
  restorer: ILayoutRestorer,
  menu: IMainMenu,
  browser: IFileBrowserFactory) {

  const add_new_source_command = "template:add-new-source"
  app.commands.addCommand(add_new_source_command, {
    caption: "Add a new source for fetching templates",
    execute: addNewSourceCommand,
    iconClass: 'jp-AddIcon',
    isEnabled: () => true,
    label: 'Add new'
  });

  let default_sources = [
    new StaticWebSource('Default',
      'https://jupyterlab-templates.netlify.com',
      'notebook'),
    new StaticWebSource('Local',
      'http://localhost:8123',
      'notebook'),
    new StaticWebSource('Default',
      'https://jupyterlab-templates.netlify.com/',
      'markdown'),
    new StaticWebSource('Local',
      'http://localhost:8123',
      'markdown')
  ]

  const templateSource = new TemplateSourcer(default_sources);

  // Add an application command
  const open_notebook_command = "template:open-notebook";
  app.commands.addCommand(open_notebook_command, {
    caption: "Initialize a notebook from a template notebook",
    execute: openCommand(templateSource),
    iconClass: "jp-NotebookIcon",
    isEnabled: () => true,
    label: "Notebook"
  });

  const open_text_command = "template:open-text";
  app.commands.addCommand(open_text_command, {
    caption: "Initialize a markdown file from a template markdown file",
    execute: openCommand(templateSource),
    iconClass: "jp-TextEditorIcon",
    isEnabled: () => true,
    label: "Text"
  });

  const activate_source_command = "template:toggle-source";
  app.commands.addCommand(activate_source_command, {
    label: args => {
      return `${args['name'] as string} (${args['filetype']})`;
    },
    execute: args => {
      const source : Source = templateSource.getSource(args['name'] as string, args['filetype'] as string);
      source.selected = (!(source.selected));
      templateSource.clearInfo();
    },
    iconClass: args => {
      const selected = templateSource.getSource(
        args['name'] as string,
        args['filetype'] as string
      ).selected;
      if (selected) {
        return 'p-Menu-itemIcon';
      } else {
        if(args['filetype'] == 'notebook') {
          return "jp-NotebookIcon" 
        } else {
          return "jp-TextEditorIcon"
        }
      }
    },
    isToggled: args => {
      return templateSource.getSource(args['name'] as string, args['filetype'] as string).selected;
    } 
  });

  let templateMenu : Menu;
  let templateSettingsMenu : Menu;
  if (menu) {
    // File > New > From Templates > Notebook / Markdown
    templateMenu = new Menu({commands:app.commands});
    templateMenu.title.label = 'From Templates';
    templateMenu.addItem({ command: open_notebook_command, args: {
      type: 'notebook', widgetFactory: 'notebook'}
    });
    templateMenu.addItem({ command: open_text_command, args: {
      type: 'file', widgetFactory: 'editor', ext: '.md'}
    });
    menu.fileMenu.newMenu.addGroup(
      [
        { type: 'submenu', submenu: templateMenu },
      ],
      40
    );

    // Settings > Template Settings > Add / Toggle
    templateSettingsMenu = new Menu({commands:app.commands});
    templateSettingsMenu.addItem({ command: add_new_source_command, args: {
    }});
    templateSettingsMenu.title.label = 'Template Settings';
    for(const s of templateSource.sources) {
      templateSettingsMenu.addItem({ command: activate_source_command,
        args: {
          name: s.name,
          filetype: s.filetype,
      },
      });
    }
    menu.settingsMenu.addGroup(
      [
        { type: 'submenu', submenu: templateSettingsMenu },
      ],
      40
    );
  }

  function addNewSourceCommand() {
    let newSource : Source;
    showDialog({
      body: new AddSourceWidget(),
      buttons: [Dialog.okButton(), Dialog.cancelButton()],
      focusNodeSelector: "input",
      title: "Add New Template Source",
    })
      .then((result) => {
        if (result.button.label === "CANCEL") {
          return;
        }
        newSource = new StaticWebSource(
          result.value['name'],
          result.value['address'],
          result.value['type'])
        console.log(newSource);
        return templateSource.addSource(newSource)
      })
      .then((result) => {
        if (result === 'Success') {
          console.log('Success')
        } else {
          showErrorMessage('Error Adding Source', result)
        }
        templateSettingsMenu.addItem({ command: activate_source_command, args: {
          name: newSource.name, filetype: newSource.filetype,
        }
        })
      })
      .catch(() => {
        showErrorMessage(
          'Add Source Failed ' + newSource.status.message, '');
      })
  }

  function openCommand(templateSource : TemplateSourcer) {
    return ((args : any) => {
      console.log(args);
      const type = (args['type'] as string) || '';
      const ext = (args['ext'] as string) || '';

      const openTemplate = new OpenTemplate(templateSource);
      openTemplate.init(type)
        .then( () => {
          openTemplate.populateParameters(openTemplate)();
          return showDialog({
            body: openTemplate.widget,
            buttons: [Dialog.cancelButton(), Dialog.okButton()],
            focusNodeSelector: "input",
            title: "New From Template",
          })
        })
        .then((result) => {
          if (result.button.label === "CANCEL") {
            return;
          }
          const path = browser.defaultBrowser.model.path;
          return new Promise((resolve) => {
            app.commands.execute(
              "docmanager:new-untitled", {path, type, ext},
            )
              .then((model) => {
                return app.commands.execute("docmanager:open", {
                  factory: args['widgetFactory'], path: model.path,
                })})
              .then((widget) => {
                return widget.context.ready.then(() => { return widget })
              })
              .then((widget) => {
                const contents : string = Mustache.render(openTemplate.contents, openTemplate.view);
                widget.content.model.fromString(contents);
                resolve(widget);
              });
          });
        });
    })
  }
}

export default extension;
