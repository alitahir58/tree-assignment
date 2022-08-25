import {NestedTreeControl} from '@angular/cdk/tree';
import {Component, OnInit} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {MatTreeNestedDataSource} from '@angular/material/tree';
import { RestProvider } from '../../providers/rest/rest';
import {MatSnackBar} from '@angular/material/snack-bar';


interface Node {
  id?: string;
  parentId?: string;
  value?: string;
  children?: Node[];
}

let TREE_DATA: Node[] = [];

/**
 * @title Tree with nested nodes
 */

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  treeControl = new NestedTreeControl<Node>(node => node.children);
  dataSource = new MatTreeNestedDataSource<Node>();
  showAddForm = false;
  addForm: FormGroup;
  showEditForm = false;
  editForm: FormGroup;
  showDelForm = false;
  selectedNode: any;
  apiNodes: any;

  constructor(public restProvider: RestProvider, private _snackBar: MatSnackBar) {
    this.dataSource.data = TREE_DATA;
    this.addForm = new FormGroup({
      name: new FormControl('', Validators.required),
    });
    this.editForm = new FormGroup({
      name: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    this.getNodes();
  }

  getNodes()
  {
    this.restProvider.getNodes("").then((result: any) => 
    {
      this.apiNodes = result.data;
      TREE_DATA = [];
      for (let i = 0; i < result.data.length; i++) 
      {
        if(!result.data[i].parentId)
        {
          let child: Node = {
            id: result.data[i].id,
            parentId: result.data[i].parentId,
            value: result.data[i].value,
            children: this.insertChildren(result.data[i].id)
          };
          TREE_DATA.push(child);
        }
      }
      this.dataSource.data = TREE_DATA;
    }, 
    (err) => {
      this.showAddForm = true;
    });
  }

  insertChildren(id: any)
  {
    let tempChildren: Node[] = [];
    for (let i = 0; i < this.apiNodes.length; i++) {
      if(this.apiNodes[i].parentId == id)
      {
        let obj: Node = {
          id: this.apiNodes[i].id,
          parentId: this.apiNodes[i].parentId,
          value: this.apiNodes[i].value,
          children: this.insertChildren(this.apiNodes[i].id)
        }
        tempChildren.push(obj);
      }
    }
    return tempChildren;
  }

  hasChild = (_: number, node: Node) => !!node.children && node.children.length > 0;

  addNode(node: any)
  {
    this.selectedNode = node;
    this.showAddForm = true;
  }

  onSubmitAdd(value: any)
  {
    let body = {
      value: value.name,
      parentId: this.selectedNode?.id
    }
	  this.restProvider.addNode(body).then((result) => 
	  {
	    var a = JSON.parse(JSON.stringify(result));
	    if(a.status == "success")
	    {
        this.getNodes();
        this.openSnackBar("Node " + value.name + " has been added");
        this.addForm.get("name")?.setValue("");
        this.showAddForm = false;
	    }
	  }, 
	  (err) => {
	  }); 
  }

  editNode(node: any)
  {
    this.selectedNode = node;
    this.editForm.get("name")?.setValue(this.selectedNode.value);
    this.showEditForm = true;
  }

  onSubmitEdit(value: any)
  {
    let body = {
      new_value: value.name,
      node_id: this.selectedNode.id
    }
	  this.restProvider.updateNode(body).then((result) => 
	  {
	    var a = JSON.parse(JSON.stringify(result));
	    if(a.status == "success")
	    {
	    	this.getNodes();
        this.openSnackBar("Node " + this.selectedNode.value+ " has been updated");
        this.addForm.get("name")?.setValue("");
        this.showEditForm = false;
	    }
	  }, 
	  (err) => {
	  });
  }

  delNode(node: any)
  {
    this.selectedNode = node;
    this.showDelForm = true;
  }

  confirmDel()
  {
	  this.restProvider.delNode(this.selectedNode.id).then((result) => 
	  {
	    var a = JSON.parse(JSON.stringify(result));
	    if(a.status == "success")
	    {
	    	this.getNodes();
        this.showDelForm = false;
        this.openSnackBar("Node " + this.selectedNode.value+ " has been deleted");
	    }
	  }, 
	  (err) => {
	  });
  }
  
  openSnackBar(message: string) {
    this._snackBar.open(message);
  }

}