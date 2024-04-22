import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "../framework/errors";

export interface CommentDoc extends BaseDoc {
  author: ObjectId;
  target: ObjectId;
  content: string;
}

export default class CommentConcept {
  public readonly comments: DocCollection<CommentDoc>;

  constructor(collectionName: string) {
    this.comments = new DocCollection<CommentDoc>(collectionName);
  }

  async create(author: ObjectId, target: ObjectId, content: string) {
    const _id = await this.comments.createOne({ author, target, content });
    return {
      msg: "Comment created successfully!",
      comment: await this.comments.readOne({ _id }),
    };
  }

  async update(_id: ObjectId, content: string) {
    await this.comments.updateOne({ _id }, { content });
    return { msg: "Comment updated!" };
  }

  async delete(_id: ObjectId) {
    await this.comments.deleteOne({ _id });
    return { msg: "Comment deleted!" };
  }

  async get(_id: ObjectId) {
    const comment = await this.comments.readOne({ _id });
    if (!comment) {
      throw new NotFoundError("Comment not found!");
    }
    return comment;
  }

  async getByAuthor(author: ObjectId) {
    return await this.comments.readMany({ author });
  }

  async getByTarget(target: ObjectId) {
    return await this.comments.readMany({ target });
  }

  async searchByContent(content: string) {
    return await this.comments.readMany({
      content: { $regex: content, $options: "i" }, // Case-insensitive content search
    });
  }

  async deleteByAuthor(author: ObjectId) {
    await this.comments.deleteMany({ author });
    return { msg: "Comments by author deleted!" };
  }

  async deleteByTarget(target: ObjectId) {
    await this.comments.deleteMany({ target });
    return { msg: "Comments on target deleted!" };
  }

  async assertAuthor(commentId: ObjectId, author: ObjectId) {
    const comment = await this.get(commentId);
    if (!comment.author.equals(author)) {
      throw new NotAllowedError("You are not the author of this comment.");
    }
  }
}
