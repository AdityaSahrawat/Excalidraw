// Local type shim: map 'bcryptjs' module to 'bcrypt' type declarations.
// This allows importing bcryptjs while leveraging @types/bcrypt definitions.
declare module 'bcryptjs' {
  import * as bcrypt from 'bcrypt';
  export = bcrypt;
}
