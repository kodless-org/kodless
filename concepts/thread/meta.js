export default {
  purpose: "Allows users to have a thread of replies under items. Similar to comment but supports nested structure.",
  prompt: `
    Thread concept manages a thread of replies under a specific item.
    Each reply has an author (generic), parent (generic), root (generic), and content (string).
    Root refers to the top-level item this reply is under. Parent refers to the immediate parent of the comment.
    Threads maintain a depth, where the root has a depth of 0.
    The actions are:
      * create(author, parent, content), here parent could either be another reply or the root item, which needs to handled appropriately.
      * update(id, content)
      * delete(id), which deletes the reply and all its children
      * get(id)
      * getByAuthor(author)
      * getByRoot(root), which gets all replies, including nested ones, under a specific root
      * countByRoot(root), which counts all replies, including nested ones, under a specific root
      * assertAuthor(reply, author), which asserts that the author of the reply is the same as the given author.
  `,
  spec: `
    ReplyDoc = {
      author: ObjectId;
      parent: ObjectId;
      root: ObjectId;
      content: string;
      depth: number;
    }
    
    ThreadConcept = {
      constructor: (collectionName: string) => ThreadConcept; // Initializes a new ThreadConcept with the given collection name
      async create: (author: ObjectId, parent: ObjectId, content: string) => {msg: string, reply: ReplyDoc}; // Creates a new reply and returns it
      async update: (_id: ObjectId, content: string) => {msg: string}; // Updates the content of a reply
      async delete: (_id: ObjectId) => {msg: string}; // Deletes a reply and all its children
      async get: (_id: ObjectId) => ReplyDoc; // Fetches a reply by its ID
      async getByAuthor: (author: ObjectId) => ReplyDoc[]; // Fetches all replies made by a specific author
      async getByRoot: (root: ObjectId) => ReplyDoc[]; // Fetches all replies belonging to a specific root
      async countByRoot: (root: ObjectId) => number; // Counts all replies belonging to a specific root
      async assertAuthor: (replyId: ObjectId, author: ObjectId) => boolean; // Asserts if a specific user is the author of a reply
    }
  `
};
