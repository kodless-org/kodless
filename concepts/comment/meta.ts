export default {
  purpose: "Allows users to add direct replies on a specific item.",
  prompt: `
    Each comment has an author (generic), a target (generic), and a content (string).
    The actions are: create, update, delete, get, getByAuthor, getByTarget, searchByContent, deleteByAuthor, deleteByTarget.
    Also have an action called assertAuthor(comment, author) that asserts that the author of the comment is the same as the given author.
    No other action should check for authorship.
  `,
  spec: `
    CommentDoc = {
      author: ObjectId;
      target: ObjectId;
      content: string;
    }
    
    CommentConcept = {
      constructor: (collectionName: string) => CommentConcept; // instantiates a new CommentConcept with the given collection name
      async create: (author: ObjectId, target: ObjectId, content: string) => {msg: string, comment: CommentDoc}; // creates a new comment and returns it
      async update: (_id: ObjectId, content: string) => {msg: string}; // updates the content of an existing comment
      async delete: (_id: ObjectId) => {msg: string}; // deletes an existing comment
      async get: (_id: ObjectId) => CommentDoc; // retrieves a comment by its ID
      async getByAuthor: (author: ObjectId) => CommentDoc[]; // retrieves all comments made by a specific author
      async getByTarget: (target: ObjectId) => CommentDoc[]; // retrieves all comments targeting a specific object
      async searchByContent: (content: string) => CommentDoc[]; // searches comments by content
      async deleteByAuthor: (author: ObjectId) => {msg: string}; // deletes all comments made by a specific author
      async deleteByTarget: (target: ObjectId) => {msg: string}; // deletes all comments targeting a specific object
      async assertAuthor: (commentId: ObjectId, author: ObjectId) => void; // verifies if a comment is authored by a specific user, throws error if not
    }
  `
};
