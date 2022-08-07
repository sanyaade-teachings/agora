/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// database connection
const db = require('../db/connection');

// import models
const Tag = require('../model/tag');

// any cross services required


/**
 * Tag only APIs
 * Managment of global tag objects
 */





exports.getAllTags = async (activeOnly) => {
    let text = "SELECT * FROM tags";
    let values = [ ];
    if(activeOnly) {
        text += " WHERE active = $1;";
        values.push( true );
    }
    
    try {
        let tags = [];
         
        let res = await db.query(text, values);
        
        for(let i=0; i<res.rows.length; i++) {
            tags.push(Tag.ormTag(res.rows[i]));
        }
        
        return tags;
        
    }
    catch(e) {
        console.log(e.stack)
    }
}


exports.getTagById = async function(tagId, activeOnly) {
    let text = "SELECT * FROM tags WHERE id = $1";
    let values = [ tagId ];
    if(activeOnly) {
        text += " AND active = $2;";
        values.push( true );
    }

    try {
        let tag = "";
         
        let res = await db.query(text, values);
        if(res.rowCount > 0) {
            tag = Tag.ormTag(res.rows[0]);
                  
        }
        return tag;
        
    }
    catch(e) {
        console.log(e.stack)
    }
}



/*
 * Tagged APIs
 * Management of the useage of tags and association with enitities and users
 */




/**
 * Get an active tag by id
 * @param {Integer} tagId 
 * @returns tag
 */






/**
 * Retrieves all active tags created by a particular owner
 * @returns All active tags as a list
 */
exports.getAllActiveTagsForOwner = async function(ownerId) {
    const text = "SELECT * FROM tags WHERE active = $1 and owned_by = $2 order by id;";
    const values = [ true, ownerId ];

    let tags = [];
    
    try {
         
        let res = await db.query(text, values);
        
        for(let i=0; i<res.rows.length; i++) {
            tags.push(Tag.ormTag(res.rows[i]));
        }
        
        return tags;
        
    }
    catch(e) {
        console.log(e.stack)
    }
    finally {
        
    }
}

/**
 * 
 * @param {*} ownerId 
 * @param {*} tagId 
 * @returns 
 */
exports.getAllActiveTagsForOwnerById = async function(ownerId, tagId) {
    const text = "SELECT * FROM tags WHERE active = $1 and owned_by = $2 and id = $3 order by id;";
    const values = [ true, ownerId, tagId ];

    let tags = [];
    
    try {
         
        let res = await db.query(text, values);
        
        for(let i=0; i<res.rows.length; i++) {
            tags.push(Tag.ormTag(res.rows[i]));
        }
        
        return tags;
        
    }
    catch(e) {
        console.log(e.stack)
    }
    finally {
        
    }
}

/**
 * Retrieves all tags created by a particular owner regardless of active status
 * @returns All tags as a list
 */
 exports.getAllTagsForOwner = async function(ownerId) {
    const text = "SELECT * FROM tags WHERE owned_by = $1 order by id;";
    const values = [ ownerId ];

    let tags = [];
    
    try {
         
        let res = await db.query(text, values);
        
        for(let i=0; i<res.rows.length; i++) {
            tags.push(Tag.ormTag(res.rows[i]));
        }

        return tags;
        
    }
    catch(e) {
        console.log(e.stack)
    }
    finally {
        
    }
}



/**
 * Saves a tag to the database, creates a new record if no id is assigned, updates existing record if there is an id.
 * @param {Tag} tag 
 * @returns Tag object with id 
 */
exports.saveTag = async function(tag) {
    // check to see if an id exists - insert / update check
    if(tag) {
        if(tag.id > 0) {
            
            // update
            console.log(1);
            let text = "UPDATE tags SET tag = $1, last_used = NOW(), owned_by = $2 WHERE id = $3;";
            let values = [ tag.tag, tag.ownedBy, tag.id ];
    
            try {
                let res = await db.query(text, values);
            }
            catch(e) {
                console.log("[ERR]: Error updating tag - " + e);
                return false;
            }
            
        }
        else {
            console.log(2);
            // insert
            let text = "INSERT INTO tags ( tag, last_used, owned_by) VALUES ($1, NOW(), $2) RETURNING id;";
            values = [ tag.tag, tag.ownedBy ];

            try {
                let res2 = await db.query(text, values);
    
                if(res2.rowCount > 0) {
                    tag.id = res2.rows[0].id;
                }
                
            }
            catch(e) {
                console.log("[ERR]: Error inserting tag - " + e);
                return false;
            }
        }
        return tag;
    }
    else {
        return false;
    }
}