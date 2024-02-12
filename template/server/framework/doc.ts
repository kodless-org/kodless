import {
  BulkWriteOptions,
  Collection,
  Condition,
  CountDocumentsOptions,
  DeleteOptions,
  DeleteResult,
  Document,
  Filter,
  FindOneAndUpdateOptions,
  FindOptions,
  ObjectId,
  OptionalUnlessRequiredId,
  ReplaceOptions,
  UpdateResult,
  WithId,
  WithoutId,
} from "mongodb";

import db from "../db";

export interface BaseDoc {
  _id: ObjectId;
  dateCreated: Date;
  dateUpdated: Date;
}

export type WithoutBase<T extends BaseDoc> = Omit<T, keyof BaseDoc>;

export default class DocCollection<Schema extends BaseDoc> {
  public readonly collection: Collection<Schema>;
  private static collectionNames: Set<string> = new Set();

  constructor(public readonly name: string) {
    if (DocCollection.collectionNames.has(name)) {
      throw new Error(`Collection '${name}' already exists!`);
    }
    this.collection = db.collection(name);
  }

  /**
   * This method removes "illegal" fields from an item
   * so the client cannot fake them.
   */
  private sanitizeItem(item: Partial<Schema>) {
    delete item._id;
    delete item.dateCreated;
    delete item.dateUpdated;
  }

  /**
   * This method fixes the _id field of a filter.
   * In case the _id is a string, it will be converted to an ObjectId.
   */
  private sanitizeFilter(filter: Filter<Schema>) {
    if (filter._id && typeof filter._id === "string" && ObjectId.isValid(filter._id)) {
      filter._id = new ObjectId(filter._id) as Condition<WithId<Schema>["_id"]>;
    }
  }

  /**
   * Add `item` to the collection. Returns the _id of the inserted document.
   */
  async createOne(item: Partial<Schema>): Promise<ObjectId> {
    this.sanitizeItem(item);
    item.dateCreated = new Date();
    item.dateUpdated = new Date();
    return (await this.collection.insertOne(item as OptionalUnlessRequiredId<Schema>)).insertedId;
  }

  /**
   * Add `items` to the collection. Returns a record object of the form `{ <index>: <_id> }` for inserted documents.
   */
  async createMany(items: Partial<Schema>[], options?: BulkWriteOptions): Promise<Record<number, ObjectId>> {
    items.forEach((item) => {
      this.sanitizeItem(item);
      item.dateCreated = new Date();
      item.dateUpdated = new Date();
    });
    return (await this.collection.insertMany(items as OptionalUnlessRequiredId<Schema>[], options)).insertedIds;
  }

  /**
   * Read the document that matches `filter`. Returns `null` if no document matches.
   */
  async readOne(filter: Filter<Schema>, options?: FindOptions): Promise<Schema | null> {
    this.sanitizeFilter(filter);
    return await this.collection.findOne<Schema>(filter, options);
  }

  /**
   * Read all documents that match `filter`.
   */
  async readMany(filter: Filter<Schema>, options?: FindOptions): Promise<Schema[]> {
    this.sanitizeFilter(filter);
    return await this.collection.find<Schema>(filter, options).toArray();
  }

  /**
   * Replace the document that matches `filter` with `item`.
   */
  async replaceOne(filter: Filter<Schema>, item: Partial<Schema>, options?: ReplaceOptions): Promise<UpdateResult<Schema> | Document> {
    this.sanitizeFilter(filter);
    this.sanitizeItem(item);
    return await this.collection.replaceOne(filter, item as WithoutId<Schema>, options);
  }

  /**
   * Update the document that matches `filter` based on existing fields in `update`.
   */
  async updateOne(filter: Filter<Schema>, update: Partial<Schema>, options?: FindOneAndUpdateOptions): Promise<UpdateResult<Schema>> {
    this.sanitizeItem(update);
    this.sanitizeFilter(filter);
    update.dateUpdated = new Date();
    return await this.collection.updateOne(filter, { $set: update }, options);
  }

  /**
   * Delete the document that matches `filter`.
   */
  async deleteOne(filter: Filter<Schema>, options?: DeleteOptions): Promise<DeleteResult> {
    this.sanitizeFilter(filter);
    return await this.collection.deleteOne(filter, options);
  }

  /**
   * Delete all documents that match `filter`.
   */
  async deleteMany(filter: Filter<Schema>, options?: DeleteOptions): Promise<DeleteResult> {
    this.sanitizeFilter(filter);
    return await this.collection.deleteMany(filter, options);
  }

  /**
   * Count all documents that match `filter`.
   */
  async count(filter: Filter<Schema>, options?: CountDocumentsOptions): Promise<number> {
    this.sanitizeFilter(filter);
    return await this.collection.countDocuments(filter, options);
  }

  /**
   * Pop one document that matches `filter`.
   * This method is equivalent to calling `readOne` and `deleteOne`.
   */
  async popOne(filter: Filter<Schema>): Promise<Schema | null> {
    this.sanitizeFilter(filter);
    const one = await this.readOne(filter);
    if (one === null) {
      return null;
    }
    await this.deleteOne({ _id: one._id } as Filter<Schema>);
    return one;
  }
}
