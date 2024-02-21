export interface IWritable {
  write(data: string): Promise<void>;
}
