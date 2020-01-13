import { OpenTemplateWidget, } from './widgets'
import { TemplateSourcer, } from './source';
import { MustacheEngine } from './mustache'

const Mustache = new MustacheEngine();

export
class OpenTemplate {
  view : any;
  contents : string;
  source : TemplateSourcer;
  widget : OpenTemplateWidget;
  paramsNode : HTMLMenuElement;
  constructor(templateSource : TemplateSourcer) {
    this.widget = new OpenTemplateWidget();
    this.source = templateSource;
  }
  public async init(type : string) {
    return this.source.fetchIndex(type)
      .then(
        templates => {
          for (let k in templates) {
            const t = templates[k];
            const val = document.createElement("option");
            val.label = `${t.source.name}/${t.pretty_name}`;
            val.text  = t.pretty_name;
            val.value = k;
            this.widget.inputNode.appendChild(val);
          }
        }
      )
      .then( () => {
        this.widget.inputNode.onchange = this.populateParameters(this);
      });
  }

  public populateParameters(context : OpenTemplate) {
    return function () {
      context.source.fetchFile(context.inputNode.value).then((contents) => {
        context.contents = contents;
        context.showParameters(Mustache.parse(contents, Mustache.tags));
      });
    }
  }

  public showParameters(tokens : Array<Array<any>>) {
    this.view = {}
    if (!(this.paramsNode)) {
      this.paramsNode = document.createElement("menu");
      this.widget.node.lastElementChild.after(this.paramsNode);
      this.paramsNode.appendChild(document.createElement("div"))
    } else {
      this.paramsNode.innerHTML = '<div></div>';
    }

    for(const t of tokens) {
      if(t[0] == "name") {
        const param : string = t[1];
        if(!(param in this.view)) {
          const div = document.createElement("div");
          this.paramsNode.lastElementChild.after(div);

          const label = document.createElement("label");
          label.textContent = param + ':';
          div.appendChild(label);

          const input = document.createElement("input");
          input.onkeyup = () => {
            this.view[param] = input.value;
          }
          this.view[param] = input.value;

          div.appendChild(input);
        }
      }
    }
  }

  public getValue(): string {
    return this.widget.inputNode.value;
  }

  get inputNode(): HTMLSelectElement {
    return this.widget.node.getElementsByTagName("select")[0] as HTMLSelectElement;
  }
}



