/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

 const express = require( 'express' );
 const router = express.Router( );

 // import controllers
 const tagController = require( '../../controller/apis/tagController' );

// tags /api/v1/auth/tags
router.route( '/' )
    .get(async (req, res) => {
        tagController.getAllTags( req, res );
    })    
    .post( ( req, res ) => { 
        console.log(1);
        tagController.saveTag( req, res, false );
    }
)

router.route( '/:id' )
    .get(async ( req, res ) => {
        tagController.getTagById( req, res );
    })
    .delete( async ( req, res ) => {
        tagController.deleteTagById( req, res );
    }
) 





module.exports = router;