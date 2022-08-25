// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { randomUUID } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors';

type treeNode = {
  id: string,
  value: string,
  parentId?: string|null
}

let db: treeNode[] = []

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {

  await NextCors(req, res, {
    // Options
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
 });
 
  console.log(req.query, req.body, req.method);
  if(req.method=="POST")
  {
    try
    {
      let newNode: treeNode = {
        id: new Date().getTime()+randomUUID(),
        value: req.body.value,
      }
      if(db.length==0){
        newNode.parentId = null
      }
      else{
        console.log(db.map(obj => {return obj.parentId}))
        console.log(db.map(obj => {return obj.id}).indexOf(req.body.parentId))
        let pIndex = db.map(obj => {return obj.id}).indexOf(req.body.parentId)
        if(pIndex==-1)
          throw new Error("Parent Id not provided");
        newNode.parentId = db[pIndex].id;
      }
      db.push(newNode);
      res.status(200).json({status: "success", message: "Node added successfully"});
    }
    catch(err: any){
      console.log(err);
      res.status(500).json({error: err.message});
    }
  }
  else if(req.method=="GET"){
    let _res = db;
    if(req.query.filter_records){
      let parentId = req.query.parentId ? req.query.parentId : null;
      _res = db.filter(obj => {
        return obj.parentId==parentId
      })
    }
    res.status(200).json({ data: _res })
  }
  else if(req.method=="PATCH"){
    try
    {
      let pIndex = db.map(obj => {return obj.id}).indexOf(req.body.node_id)
      if(pIndex==-1)
        throw new Error("Parent Id not found");
      if(!req.body.new_value)
        throw new Error("Please provide update value");
      db[pIndex].value = req.body.new_value
      res.status(200).json({status: "success", message: "Node edited successfully"});
    }
    catch(err: any){
      console.log(err);
      res.status(500).json({error: err.message});
    }
  }
  else if(req.method=="DELETE"){
    try
    {
      let pIndex = db.map(obj => {return obj.id}).indexOf(req.body.node_id)
      if(pIndex==-1)
        throw new Error("Invalid ID provided");
      else if(pIndex==0 && db.length>1)
        throw new Error("Root node cannot be deleted");
      let _newParentId = db[pIndex].parentId;
      db.splice(pIndex,1);
      let filtered = db.filter(obj => {
        return obj.parentId == req.body.node_id
      })
      for(let _f of filtered)
        _f.parentId = _newParentId;
      res.status(200).json({status: "success", message: "Node deleted successfully"});
    }
    catch(err: any){
      console.log(err);
      res.status(500).json({error: err.message});
    }
  }
  else
    res.status(404);
}
