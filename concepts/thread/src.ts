import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "../framework/errors";

interface ReplyDoc extends BaseDoc {
  author: ObjectId;
  parent: ObjectId;
  root: ObjectId;
  content: string;
  depth: number;
}

export default class ThreadConcept {
  public readonly replies: DocCollection<ReplyDoc>;

  constructor(collectionName: string) {
    this.replies = new DocCollection<ReplyDoc>(collectionName);
  }

  async create(author: ObjectId, parent: ObjectId, content: string) {
    const parentReply = await this.replies.readOne({ _id: parent });
    let root: ObjectId, depth: number;

    if (parentReply) {
      root = parentReply.root;
      depth = parentReply.depth + 1;
    } else {
      root = parent; // When there's no parent, the parent itself is the root.
      depth = 0;
    }

    const _id = await this.replies.createOne({ author, parent, root, content, depth });
    return { msg: "Reply created successfully!", reply: await this.replies.readOne({ _id }) };
  }

  async update(_id: ObjectId, content: string) {
    const result = await this.replies.updateOne({ _id }, { content });
    if (!result.matchedCount) {
      throw new NotFoundError("Reply not found!");
    }
    return { msg: "Reply updated!" };
  }

  async delete(_id: ObjectId) {
    const replyToDelete = await this.replies.readOne({ _id });
    if (!replyToDelete) {
      throw new NotFoundError("Reply not found!");
    }
    
    const deleteRecursively = async (_id: ObjectId) => {
      const children = await this.replies.readMany({ parent: _id });
      for (const child of children) {
        await deleteRecursively(child._id);
      }
      await this.replies.deleteOne({ _id });
    }

    await deleteRecursively(_id);

    return { msg: "Reply and all its children deleted!" };
  }

  async get(_id: ObjectId) {
    const reply = await this.replies.readOne({ _id });
    if (!reply) {
      throw new NotFoundError("Reply not found!");
    }
    return reply;
  }

  async getByAuthor(author: ObjectId) {
    return await this.replies.readMany({ author });
  }

  async getByRoot(root: ObjectId) {
    return await this.replies.readMany({ root });
  }

  async countByRoot(root: ObjectId) {
    const count = await this.replies.collection.countDocuments({ root });
    return count;
  }

  async assertAuthor(replyId: ObjectId, author: ObjectId) {
    const reply = await this.get(replyId);
    if (!reply || !reply.author.equals(author)) {
      throw new NotAllowedError("You are not the author of this reply.");
    }
    return true;
  }
}