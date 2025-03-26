import { TaskSpecification, TaskArgument } from '../types/taska';


export const createEmptyTaskSpec = (): TaskSpecification => ({
  name: "task::",
  description: "",
  arguments: [],
  resolver: "0x1", // default resolver address
  on_chain: false,
  price: "0",
});

export const createEmptyTaskArgument = (): TaskArgument => ({
  name: '',
  type_desc: 'string',
  description: '',
  required: false,
});