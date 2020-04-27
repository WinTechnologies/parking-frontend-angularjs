export class Client {
  id: string;
  firstname: string;
  lastname: string;
  phone_number: string;
  email: string;
  address: string;
  designation: string;
  project_id: number;

  public isEqual(other: Client) {
    const findItem = Object.keys(Client).find(field => {
      if (this[field] !== other[field]) {
        return true;
      } else {
        return false;
      }
    });
    return findItem ? true : false;
  }
};