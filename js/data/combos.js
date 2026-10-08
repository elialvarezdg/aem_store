/* =========================================================
   COMBOS
   ========================================================= */
   
export const combos = [

    {
        id: "combo-001",
        category: "Combo",

        products: [
            { productId: "prod-001", quantity: 10, um: "Lb"   },
            { productId: "prod-005", quantity: 4,  um: "tubo" },
            { productId: "prod-006", quantity: 2,  um: "pqte" },
            { productId: "prod-034", quantity: 1,  um: "tubo" },
            { productId: "prod-031", quantity: 2,  um: "Lt"   },
            { productId: "prod-033", quantity: 5,  um: "Lb"   },
            { productId: "prod-030", quantity: 10, um: "Lb"   },
            { productId: "prod-032", quantity: 1,  um: "u"    },
        ],

        name: "Combo Grande",
        price: 90,
        currency: "USD",
        image: "image/combo/combo_01.jpg",
        post: "image/combo/combo_01_90.jpg",

        status: "available",
        outstanding: true,
        visible: true,
    },

    {
        id: "combo-002",
        category: "Combo",

        products: [
            { productId: "prod-001", quantity: 5, um: "Lb"   },
            { productId: "prod-005", quantity: 2, um: "tubo" },
            { productId: "prod-006", quantity: 1, um: "pqte" },
            { productId: "prod-034", quantity: 1, um: "tubo" },
            { productId: "prod-031", quantity: 1, um: "Lt"   },
            { productId: "prod-033", quantity: 5, um: "Lb"   },
            { productId: "prod-030", quantity: 5, um: "Lb"   },
        ],

        name: "Combo Pequeño",
        price: 50,
        currency: "USD",
        image: "image/combo/combo_02.jpg",
        post: "image/combo/combo_02_50.jpg",

        status: "available",
        outstanding: true,
        visible: true,

        
    },

];