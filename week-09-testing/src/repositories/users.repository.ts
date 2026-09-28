import { UserModel, type IUser } from '../models/user.model.js';

export async function findUserByEmail(email: string): Promise<IUser | null> {
  return UserModel.findOne({ email }).lean<IUser>().exec();
}

export async function createUser(
  data: Pick<IUser, 'name' | 'email' | 'password' | 'role'>,
): Promise<IUser> {
  const user = new UserModel(data);
  const saved = await user.save();
  // toObject() devuelve un objeto plano; sin esto, al hacer spread del documento de
  // Mongoose se filtran campos internos ($__, _doc) e incluso el hash de la contraseña.
  return saved.toObject() as unknown as IUser;
}

export async function findUserById(id: string): Promise<IUser | null> {
  return UserModel.findById(id).lean<IUser>().exec();
}
