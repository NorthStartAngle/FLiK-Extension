/**
 * written by Jin YC.  2022.11.01
 */

export const restricted_urls = ["chrome://extensions/", "chrome-extension://", "chrome://newtab/"];

//layouts select box loads from this object
export const _layouts = [
    {
        slotcount: 1,
        class: [{
            name: 'tab-60x60 tab',
            type: 'tab',
            children: [{
                name: 'tab-wrapper',
                type: 'tab-wrapper',
                children: [
                    { name: 'tab-header', type: 'tab-header' },
                    { name: 'tab-header', type: 'tab-header' },
                    { name: 'tab-header', type: 'tab-header' },
                    { name: 'tab-num', type: 'slot' }
                ]
            }]
        }]
    },
    {
        slotcount: 2,
        class: [{
                name: 'tab-45x60 tab',
                type: 'tab',
                children: [{
                    name: 'tab-wrapper',
                    type: 'tab-wrapper',
                    children: [
                        { name: 'tab-header', type: 'tab-header' },
                        { name: 'tab-header', type: 'tab-header' },
                        { name: 'tab-num', type: 'slot' }
                    ]
                }]
            },
            { name: 'slot-15x60 slot', type: 'slot' },
        ]
    },
    {
        slotcount: 2,
        class: [{
                name: 'tab-36x60 tab',
                type: 'tab',
                children: [{
                    name: 'tab-wrapper',
                    type: 'tab-wrapper',
                    children: [
                        { name: 'tab-header', type: 'tab-header' },
                        { name: 'tab-header', type: 'tab-header' },
                        { name: 'tab-num', type: 'slot' }
                    ]
                }]
            },
            { name: 'slot-24x60 slot', type: 'slot' }
        ]
    },
    {
        slotcount: 2,
        class: [{
                name: 'tab-30x60 tab',
                type: 'tab',
                children: [{
                    name: 'tab-wrapper',
                    type: 'tab-wrapper',
                    children: [
                        { name: 'tab-header', type: 'tab-header' },
                        { name: 'tab-num', type: 'slot' }
                    ]
                }]
            }, {
                name: 'tab-30x60 tab',
                type: 'tab',
                children: [{
                    name: 'tab-wrapper',
                    type: 'tab-wrapper',
                    children: [
                        { name: 'tab-header', type: 'tab-header' },
                        { name: 'tab-num', type: 'slot' }
                    ]
                }]
            }
        ]
    },
    {
        slotcount: 2,
        class: [{
                name: 'slot-24x60 slot',
                type: 'slot',
            },
            {
                name: 'tab-36x60 tab',
                type: 'tab',
                children: [{
                    name: 'tab-wrapper',
                    type: 'tab-wrapper',
                    children: [
                        { name: 'tab-header', type: 'tab-header' },
                        { name: 'tab-header', type: 'tab-header' },
                        { name: 'tab-num', type: 'slot' }
                    ]
                }]
            },
        ]
    },
    {
        slotcount: 2,
        class: [
            { name: 'slot-15x60 slot', type: 'slot' },
            {
                name: 'tab-45x60 tab',
                type: 'tab',
                children: [{
                    name: 'tab-wrapper',
                    type: 'tab-wrapper',
                    children: [
                        { name: 'tab-header', type: 'tab-header' },
                        { name: 'tab-header', type: 'tab-header' },
                        { name: 'tab-num', type: 'slot' }
                    ]
                }]
            }
        ]
    },
    {
        slotcount: 2,
        class: [{
            name: 'v-wrapper',
            type: 'slot-wrapper',
            children: [
                {
                    name: 'tab-60x30 tab',
                    type: 'tab',
                    children: [{
                        name: 'tab-wrapper',
                        type: 'tab-wrapper',
                        children: [
                            { name: 'tab-header', type: 'tab-header' },
                            { name: 'tab-header', type: 'tab-header' },
                            { name: 'tab-header', type: 'tab-header' },
                            { name: 'tab-num', type: 'slot' }
                        ]
                    }]
                }, {
                    name: 'tab-60x30 tab',
                    type: 'tab',
                    children: [{
                        name: 'tab-wrapper',
                        type: 'tab-wrapper',
                        children: [
                            { name: 'tab-header', type: 'tab-header' },
                            { name: 'tab-header', type: 'tab-header' },
                            { name: 'tab-header', type: 'tab-header' },
                            { name: 'tab-num', type: 'slot' }
                        ]
                    }]
                }
            ]
        }]
    },
    {
        slotcount: 3,
        class: [{
            name: 'tab-45x60 tab',
            type: 'tab',
            children: [{
                name: 'tab-wrapper',
                type: 'tab-wrapper',
                children: [
                    { name: 'tab-header', type: 'tab-header' },
                    { name: 'tab-header', type: 'tab-header' },
                    { name: 'tab-num', type: 'slot' }
                ]
            }]
        },{
            name: 'v-wrapper',
            type: 'slot-wrapper',
            children: [
                { name: 'slot-15x30 slot', type: 'slot' },
                { name: 'slot-15x30 slot', type: 'slot' }
            ]
        }]
    },
    {
        slotcount: 3,
        class: [{
                name: 'tab-36x60 tab',
                type: 'tab',
                children: [{
                    name: 'tab-wrapper',
                    type: 'tab-wrapper',
                    children: [
                        { name: 'tab-header', type: 'tab-header' },
                        { name: 'tab-header', type: 'tab-header' },
                        { name: 'tab-num', type: 'slot' }
                    ]
                }]
            },
            {
                name: 'v-wrapper',
                type: 'slot-wrapper',
                children: [
                    { name: 'slot-24x30 slot', type: 'slot' },
                    { name: 'slot-24x30 slot', type: 'slot' }
                ]
            },
        ]
    },
    {
        slotcount: 3,
        class: [{
            name: 'tab-30x60 tab',
            type: 'tab',
            children: [{
                name: 'tab-wrapper',
                type: 'tab-wrapper',
                children: [
                    { name: 'tab-header', type: 'tab-header' },
                    { name: 'tab-num', type: 'slot' }
                ]
            }]
        }, {
            name: 'v-wrapper',
            type: 'slot-wrapper',
            children: [{
                    name: 'tab-30x30 tab',
                    type: 'tab',
                    children: [{
                        name: 'tab-wrapper',
                        type: 'tab-wrapper',
                        children: [
                            { name: 'tab-header', type: 'tab-header' },
                            { name: 'tab-num', type: 'slot' }
                        ]
                    }]
                }, {
                    name: 'tab-30x30 tab',
                    type: 'tab',
                    children: [{
                        name: 'tab-wrapper',
                        type: 'tab-wrapper',
                        children: [
                            { name: 'tab-header', type: 'tab-header' },
                            { name: 'tab-num', type: 'slot' }
                        ]
                    }]
                }
            ]
        }]
    },
    {
        slotcount: 3,
        class: [{
            name: 'v-wrapper',
            type: 'slot-wrapper',
            children: [
                { name: 'slot-15x30 slot', type: 'slot' },
                { name: 'slot-15x30 slot', type: 'slot' }
            ]
        }, {
            name: 'tab-45x60 tab',
            type: 'tab',
            children: [{
                name: 'tab-wrapper',
                type: 'tab-wrapper',
                children: [
                    { name: 'tab-header', type: 'tab-header' },
                    { name: 'tab-header', type: 'tab-header' },
                    { name: 'tab-num', type: 'slot' }
                ]
            }]
        }]
    },
    {
        slotcount: 3,
        class: [{
            name: 'v-wrapper',
            type: 'slot-wrapper',
            children: [
                { name: 'slot-24x30 slot', type: 'slot' },
                { name: 'slot-24x30 slot', type: 'slot' }
            ]
        }, {
            name: 'tab-36x60 tab',
            type: 'tab',
            children: [{
                name: 'tab-wrapper',
                type: 'tab-wrapper',
                children: [
                    { name: 'tab-header', type: 'tab-header' },
                    { name: 'tab-header', type: 'tab-header' },
                    { name: 'tab-num', type: 'slot' }
                ]
            }]
        }]
    },
    {
        slotcount: 3,
        class: [
            {
                name: 'v-wrapper',
                type: 'slot-wrapper',
                children: [
                    {
                        name: 'tab-30x30 tab',
                        type: 'tab',
                        children: [{
                            name: 'tab-wrapper',
                            type: 'tab-wrapper',
                            children: [
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-num', type: 'slot' }
                            ]
                        }]
                    },{
                        name: 'tab-30x30 tab',
                        type: 'tab',
                        children: [{
                            name: 'tab-wrapper',
                            type: 'tab-wrapper',
                            children: [
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-num', type: 'slot' }
                            ]
                        }]
                    },
                ]
            },{
                name: 'tab-30x60 tab',
                type: 'tab',
                children: [{
                    name: 'tab-wrapper',
                    type: 'tab-wrapper',
                    children: [
                        { name: 'tab-header', type: 'tab-header' },
                        { name: 'tab-num', type: 'slot' }
                    ]
                }]
            }
        ]
    },
    {
        slotcount: 3,
        class: [
            {
                type: 'slot-wrapper',
                name: 'v-wrapper',
                children: [
                    {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            {
                                name: 'tab-30x30 tab',
                                type: 'tab',
                                children: [{
                                    name: 'tab-wrapper',
                                    type: 'tab-wrapper',
                                    children: [
                                        { name: 'tab-header', type: 'tab-header' },
                                        { name: 'tab-num', type: 'slot' }
                                    ]
                                }]
                            },{
                                name: 'tab-30x30 tab',
                                type: 'tab',
                                children: [{
                                    name: 'tab-wrapper',
                                    type: 'tab-wrapper',
                                    children: [
                                        { name: 'tab-header', type: 'tab-header' },
                                        { name: 'tab-num', type: 'slot' }
                                    ]
                                }]
                            }
                        ]
                    },{
                        name: 'tab-60x30 tab',
                        type: 'tab',
                        children: [{
                            name: 'tab-wrapper',
                            type: 'tab-wrapper',
                            children: [
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-num', type: 'slot' }
                            ]
                        }]
                    }
                ]
            },
        ]
    },
    {
        slotcount: 3,
        class: [
            {
                name: 'v-wrapper',
                type: 'slot-wrapper',
                children: [
                    {
                        name: 'tab-60x30 tab',
                        type: 'tab',
                        children: [{
                            name: 'tab-wrapper',
                            type: 'tab-wrapper',
                            children: [
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-num', type: 'slot' }
                            ]
                        }]
                    }, {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            {
                                name: 'tab-30x30 tab',
                                type: 'tab',
                                children: [{
                                    name: 'tab-wrapper',
                                    type: 'tab-wrapper',
                                    children: [
                                        { name: 'tab-header', type: 'tab-header' },
                                        { name: 'tab-num', type: 'slot' }
                                    ]
                                }]
                            },{
                                name: 'tab-30x30 tab',
                                type: 'tab',
                                children: [{
                                    name: 'tab-wrapper',
                                    type: 'tab-wrapper',
                                    children: [
                                        { name: 'tab-header', type: 'tab-header' },
                                        { name: 'tab-num', type: 'slot' }
                                    ]
                                }]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        slotcount: 4,
        class: [{
            name: 'v-wrapper w-100',
            type: 'slot-wrapper',
            children: [
                {
                    name: 'h-wrapper',
                    type: 'slot-wrapper',
                    children: [
                        {
                            name: 'tab-30x30 tab',
                            type: 'tab',
                            children: [{
                                name: 'tab-wrapper',
                                type: 'tab-wrapper',
                                children: [
                                    { name: 'tab-header', type: 'tab-header' },
                                    { name: 'tab-num', type: 'slot' }
                                ]
                            }]
                        }, {
                            name: 'tab-30x30 tab',
                            type: 'tab',
                            children: [{
                                name: 'tab-wrapper',
                                type: 'tab-wrapper',
                                children: [
                                    { name: 'tab-header', type: 'tab-header' },
                                    { name: 'tab-num', type: 'slot' }
                                ]
                            }]
                        }
                    ]
                }, {
                    name: 'h-wrapper',
                    type: 'slot-wrapper',
                    children: [
                        {
                            name: 'tab-30x30 tab',
                            type: 'tab',
                            children: [{
                                name: 'tab-wrapper',
                                type: 'tab-wrapper',
                                children: [
                                    { name: 'tab-header', type: 'tab-header' },
                                    { name: 'tab-num', type: 'slot' }
                                ]
                            }]
                        }, {
                            name: 'tab-30x30 tab',
                            type: 'tab',
                            children: [{
                                name: 'tab-wrapper',
                                type: 'tab-wrapper',
                                children: [
                                    { name: 'tab-header', type: 'tab-header' },
                                    { name: 'tab-num', type: 'slot' }
                                ]
                            }]
                        }
                    ]
                }
            ]
        }]
    },
    {
        slotcount: 6,
        class: [
            {
                name: 'v-wrapper w-100',
                type: 'slot-wrapper',
                children: [
                    {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            { name: 'slot-30x20 slot', type: 'slot' },
                            { name: 'slot-30x20 slot', type: 'slot' }
                        ]
                    }, {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            { name: 'slot-30x20 slot', type: 'slot' },
                            { name: 'slot-30x20 slot', type: 'slot' }
                        ]
                    }, {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            { name: 'slot-30x20 slot', type: 'slot' },
                            { name: 'slot-30x20 slot', type: 'slot' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        slotcount: 6,
        class:[
            {
                name: 'v-wrapper w-100',
                type: 'slot-wrapper',
                children: [
                    {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            { name: 'slot-20x30 slot', type: 'slot' },
                            { name: 'slot-20x30 slot', type: 'slot' },
                            { name: 'slot-20x30 slot', type: 'slot' }
                        ]
                    }, {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            { name: 'slot-20x30 slot', type: 'slot' },
                            { name: 'slot-20x30 slot', type: 'slot' },
                            { name: 'slot-20x30 slot', type: 'slot' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        slotcount: 9,
        class: [
            {
                name: 'v-wrapper w-100',
                type: 'slot-wrapper',
                children: [
                    {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            { name: 'slot-20x20 slot', type: 'slot' },
                            { name: 'slot-20x20 slot', type: 'slot' },
                            { name: 'slot-20x20 slot', type: 'slot' }
                        ]
                    }, {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            { name: 'slot-20x20 slot', type: 'slot' },
                            { name: 'slot-20x20 slot', type: 'slot' },
                            { name: 'slot-20x20 slot', type: 'slot' }
                        ]
                    }, {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            { name: 'slot-20x20 slot', type: 'slot' },
                            { name: 'slot-20x20 slot', type: 'slot' },
                            { name: 'slot-20x20 slot', type: 'slot' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        slotcount: 4,
        class: [
            {
                name: 'tab-45x60 tab',
                type: 'tab',
                children: [{
                    name: 'tab-wrapper',
                    type: 'tab-wrapper',
                    children: [
                        { name: 'tab-header', type: 'tab-header' },
                        { name: 'tab-header', type: 'tab-header' },
                        { name: 'tab-num', type: 'slot' }
                    ]
                }]
            }, {
                name: 'v-wrapper',
                type: 'slot-wrapper',
                children: [
                    { name: 'slot-15x20 slot', type: 'slot' },
                    { name: 'slot-15x20 slot', type: 'slot' },
                    { name: 'slot-15x20 slot', type: 'slot' }
                ]
            }
        ]
    },
    {
        slotcount: 4,
        class: [{
            name: 'tab-36x60 tab',
            type: 'tab',
            children: [{
                name: 'tab-wrapper',
                type: 'tab-wrapper',
                children: [
                    { name: 'tab-header', type: 'tab-header' },
                    { name: 'tab-header', type: 'tab-header' },
                    { name: 'tab-num', type: 'slot' }
                ]
            }]
        },
        {
            name: 'v-wrapper',
            type: 'slot-wrapper',
            children: [
                { name: 'slot-24x20 slot', type: 'slot' },
                { name: 'slot-24x20 slot', type: 'slot' },
                { name: 'slot-24x20 slot', type: 'slot' }
            ]
        }]
    },
    {
        slotcount: 4,
        class: [
            {
                name: 'tab-30x60 tab',
                type: 'tab',
                children: [{
                    name: 'tab-wrapper',
                    type: 'tab-wrapper',
                    children: [
                        { name: 'tab-header', type: 'tab-header' },
                        { name: 'tab-num', type: 'slot' }
                    ]
                }]
            },
            {
                name: 'v-wrapper',
                type: 'slot-wrapper',
                children: [
                    { name: 'slot-30x20 slot', type: 'slot' },
                    { name: 'slot-30x20 slot', type: 'slot' },
                    { name: 'slot-30x20 slot', type: 'slot' }
                ]
            }
        ]
    },
    {
        slotcount: 4,
        class: [
            {
                name: 'v-wrapper',
                type: 'slot-wrapper',
                children: [
                    { name: 'slot-30x20 slot', type: 'slot' },
                    { name: 'slot-30x20 slot', type: 'slot' },
                    { name: 'slot-30x20 slot', type: 'slot' }
                ]
            },
            {
                name: 'tab-30x60 tab',
                type: 'tab',
                children: [{
                    name: 'tab-wrapper',
                    type: 'tab-wrapper',
                    children: [
                        { name: 'tab-header', type: 'tab-header' },
                        { name: 'tab-num', type: 'slot' }
                    ]
                }]
            }
        ]
    },
    {
        slotcount: 4,
        class: [
            {
                name: 'v-wrapper',
                type: 'slot-wrapper',
                children: [
                    { name: 'slot-24x20 slot', type: 'slot' },
                    { name: 'slot-24x20 slot', type: 'slot' },
                    { name: 'slot-24x20 slot', type: 'slot' }
                ]
            }, {
                name: 'tab-36x60 tab',
                type: 'tab',
                children: [{
                    name: 'tab-wrapper',
                    type: 'tab-wrapper',
                    children: [
                        { name: 'tab-header', type: 'tab-header' },
                        { name: 'tab-header', type: 'tab-header' },
                        { name: 'tab-num', type: 'slot' }
                    ]
                }]
            },
        ]
    },
    {
        slotcount: 4,
        class: [
            {
                name: 'v-wrapper',
                type: 'slot-wrapper',
                children: [
                    { name: 'slot-15x20 slot', type: 'slot' },
                    { name: 'slot-15x20 slot', type: 'slot' },
                    { name: 'slot-15x20 slot', type: 'slot' }
                ]
            }, {
                name: 'tab-45x60 tab',
                type: 'tab',
                children: [{
                    name: 'tab-wrapper',
                    type: 'tab-wrapper',
                    children: [
                        { name: 'tab-header', type: 'tab-header' },
                        { name: 'tab-header', type: 'tab-header' },
                        { name: 'tab-num', type: 'slot' }
                    ]
                }]
            }
        ]
    },
    {
        slotcount: 3,
        class: [
            {
                name: 'tab-30x60 tab',
                type: 'tab',
                children: [{
                    name: 'tab-wrapper',
                    type: 'tab-wrapper',
                    children: [
                        { name: 'tab-header', type: 'tab-header' },
                        { name: 'tab-num', type: 'slot' }
                    ]
                }]
            },
            { name: 'slot-15x60-double slot', type: 'slot' },
            { name: 'slot-15x60-double slot', type: 'slot' }
        ]
    },
    {
        slotcount: 3,
        class: [
            { name: 'slot-15x60-double slot', type: 'slot' },
            { name: 'slot-15x60-double slot', type: 'slot' },
            {
                name: 'tab-30x60 tab',
                type: 'tab',
                children: [{
                    name: 'tab-wrapper',
                    type: 'tab-wrapper',
                    children: [
                        { name: 'tab-header', type: 'tab-header' },
                        { name: 'tab-num', type: 'slot' }
                    ]
                }]
            }
        ]
    },
    {
        slotcount: 5,
        class: [
            {
                name: 'tab-30x60 tab',
                type: 'tab',
                children: [{
                    name: 'tab-wrapper',
                    type: 'tab-wrapper',
                    children: [
                        { name: 'tab-header', type: 'tab-header' },
                        { name: 'tab-num', type: 'slot' }
                    ]
                }]
            }, {
                name: 'v-wrapper w-50',
                type: 'slot-wrapper',
                children: [{
                    name: 'h-wrapper',
                    type: 'slot-wrapper',
                    children: [
                        { name: 'slot-15x30-double slot', type: 'slot' },
                        { name: 'slot-15x30-double slot', type: 'slot' },
                    ]
                }, {
                    name: 'h-wrapper',
                    type: 'slot-wrapper',
                    children: [
                        { name: 'slot-15x30-double slot', type: 'slot' },
                        { name: 'slot-15x30-double slot', type: 'slot' },
                    ]
                }]
            }
        ]
    },
    {
        slotcount: 5,
        class: [
            {
                name: 'v-wrapper w-50',
                type: 'slot-wrapper',
                children: [{
                    name: 'h-wrapper',
                    type: 'slot-wrapper',
                    children: [
                        { name: 'slot-15x30-double slot', type: 'slot' },
                        { name: 'slot-15x30-double slot', type: 'slot' },
                    ]
                }, {
                    name: 'h-wrapper',
                    type: 'slot-wrapper',
                    children: [
                        { name: 'slot-15x30-double slot', type: 'slot' },
                        { name: 'slot-15x30-double slot', type: 'slot' },
                    ]
                }]
            }, {
                name: 'tab-30x60 tab',
                type: 'tab',
                children: [{
                    name: 'tab-wrapper',
                    type: 'tab-wrapper',
                    children: [
                        { name: 'tab-header', type: 'tab-header' },
                        { name: 'tab-num', type: 'slot' }
                    ]
                }]
            }
        ]
    },
    {
        slotcount: 3,
        class: [
            { name: 'slot-20x60 slot', type: 'slot' },
            { name: 'slot-20x60 slot', type: 'slot' },
            { name: 'slot-20x60 slot', type: 'slot' }
        ]
    },
    {
        slotcount: 4,
        class: [
            { name: 'slot-15x60-double slot', type: 'slot' },
            { name: 'slot-15x60-double slot', type: 'slot' },
            { name: 'slot-15x60-double slot', type: 'slot' },
            { name: 'slot-15x60-double slot', type: 'slot' }
        ]
    },
    {
        slotcount: 8,
        class: [
            {
                name: 'h-wrapper',
                type: 'slot-wrapper',
                children: [
                    { name: 'slot-15x30-double slot', type: 'slot' },
                    { name: 'slot-15x30-double slot', type: 'slot' },
                    { name: 'slot-15x30-double slot', type: 'slot' },
                    { name: 'slot-15x30-double slot', type: 'slot' }
                ]
            }, {
                name: 'h-wrapper',
                type: 'slot-wrapper',
                children: [
                    { name: 'slot-15x30-double slot', type: 'slot' },
                    { name: 'slot-15x30-double slot', type: 'slot' },
                    { name: 'slot-15x30-double slot', type: 'slot' },
                    { name: 'slot-15x30-double slot', type: 'slot' }
                ]
            }
        ]
    },
    {
        slotcount: 10,
        class: [
            {
                name: 'h-wrapper',
                type: 'slot-wrapper',
                children: [
                    { name: 'slot-12x30 slot', type: 'slot' },
                    { name: 'slot-12x30 slot', type: 'slot' },
                    { name: 'slot-12x30 slot', type: 'slot' },
                    { name: 'slot-12x30 slot', type: 'slot' },
                    { name: 'slot-12x30 slot', type: 'slot' }
                ]
            }, {
                name: 'h-wrapper',
                type: 'slot-wrapper',
                children: [
                    { name: 'slot-12x30 slot', type: 'slot' },
                    { name: 'slot-12x30 slot', type: 'slot' },
                    { name: 'slot-12x30 slot', type: 'slot' },
                    { name: 'slot-12x30 slot', type: 'slot' },
                    { name: 'slot-12x30 slot', type: 'slot' }
                ]
            }
        ]
    },
    {
        slotcount: 4,
        class: [
            {
                name: 'v-wrapper',
                type: 'slot-wrapper',
                children: [
                    {
                        name: 'tab-60x30 tab',
                        type: 'tab',
                        children: [{
                            name: 'tab-wrapper',
                            type: 'tab-wrapper',
                            children: [
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-num', type: 'slot' }
                            ]
                        }]
                    }, {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            { name: 'slot-20x30 slot', type: 'slot' },
                            { name: 'slot-20x30 slot', type: 'slot' },
                            { name: 'slot-20x30 slot', type: 'slot' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        slotcount: 5,
        class: [
            {
                name: 'v-wrapper',
                type: 'slot-wrapper',
                children: [
                    {
                        name: 'tab-60x30 tab',
                        type: 'tab',
                        children: [{
                            name: 'tab-wrapper',
                            type: 'tab-wrapper',
                            children: [
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-num', type: 'slot' }
                            ]
                        }]
                    }, {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            { name: 'slot-15x30-double slot', type: 'slot' },
                            { name: 'slot-15x30-double slot', type: 'slot' },
                            { name: 'slot-15x30-double slot', type: 'slot' },
                            { name: 'slot-15x30-double slot', type: 'slot' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        slotcount: 6,
        class: [
            {
                name: 'v-wrapper',
                type: 'slot-wrapper',
                children: [
                    {
                        name: 'tab-60x30 tab',
                        type: 'tab',
                        children: [{
                            name: 'tab-wrapper',
                            type: 'tab-wrapper',
                            children: [
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-num', type: 'slot' }
                            ]
                        }]
                    }, {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            { name: 'slot-12x30 slot', type: 'slot' },
                            { name: 'slot-12x30 slot', type: 'slot' },
                            { name: 'slot-12x30 slot', type: 'slot' },
                            { name: 'slot-12x30 slot', type: 'slot' },
                            { name: 'slot-12x30 slot', type: 'slot' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        slotcount: 4,
        class: [
            {
                name: 'v-wrapper',
                type: 'slot-wrapper',
                children: [
                    {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            { name: 'slot-20x30 slot', type: 'slot' },
                            { name: 'slot-20x30 slot', type: 'slot' },
                            { name: 'slot-20x30 slot', type: 'slot' }
                        ]
                    }, {
                        name: 'tab-60x30 tab',
                        type: 'tab',
                        children: [{
                            name: 'tab-wrapper',
                            type: 'tab-wrapper',
                            children: [
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-num', type: 'slot' }
                            ]
                        }]
                    }
                ]
            }
        ]
    },
    {
        slotcount: 5,
        class: [
            {
                name: 'v-wrapper',
                type: 'slot-wrapper',
                children: [
                    {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            { name: 'slot-15x30-double slot', type: 'slot' },
                            { name: 'slot-15x30-double slot', type: 'slot' },
                            { name: 'slot-15x30-double slot', type: 'slot' },
                            { name: 'slot-15x30-double slot', type: 'slot' }
                        ]
                    }, {
                        name: 'tab-60x30 tab',
                        type: 'tab',
                        children: [{
                            name: 'tab-wrapper',
                            type: 'tab-wrapper',
                            children: [
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-num', type: 'slot' }
                            ]
                        }]
                    }
                ]
            }
        ]
    },
    {
        slotcount: 6,
        class: [
            {
                name: 'v-wrapper',
                type: 'slot-wrapper',
                children: [
                    {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            { name: 'slot-12x30 slot', type: 'slot' },
                            { name: 'slot-12x30 slot', type: 'slot' },
                            { name: 'slot-12x30 slot', type: 'slot' },
                            { name: 'slot-12x30 slot', type: 'slot' },
                            { name: 'slot-12x30 slot', type: 'slot' }
                        ]
                    }, {
                        name: 'tab-60x30 tab',
                        type: 'tab',
                        children: [{
                            name: 'tab-wrapper',
                            type: 'tab-wrapper',
                            children: [
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-header', type: 'tab-header' },
                                { name: 'tab-num', type: 'slot' }
                            ]
                        }]
                    }
                ]
            }
        ]
    },
    {
        slotcount: 5,
        class: [
            {
                name: 'v-wrapper w-100',
                type: 'slot-wrapper',
                children: [
                    {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            {
                                name: 'tab-30x30 tab',
                                type: 'tab',
                                children: [{
                                    name: 'tab-wrapper',
                                    type: 'tab-wrapper',
                                    children: [
                                        { name: 'tab-header', type: 'tab-header' },
                                        { name: 'tab-num', type: 'slot' }
                                    ]
                                }]
                            },{
                                name: 'tab-30x30 tab',
                                type: 'tab',
                                children: [{
                                    name: 'tab-wrapper',
                                    type: 'tab-wrapper',
                                    children: [
                                        { name: 'tab-header', type: 'tab-header' },
                                        { name: 'tab-num', type: 'slot' }
                                    ]
                                }]
                            }
                        ]
                    }, {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            { name: 'slot-20x30 slot', type: 'slot' },
                            { name: 'slot-20x30 slot', type: 'slot' },
                            { name: 'slot-20x30 slot', type: 'slot' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        slotcount: 6,
        class: [
            {
                name: 'v-wrapper w-100',
                type: 'slot-wrapper',
                children: [
                    {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            {
                                name: 'tab-30x30 tab',
                                type: 'tab',
                                children: [{
                                    name: 'tab-wrapper',
                                    type: 'tab-wrapper',
                                    children: [
                                        { name: 'tab-header', type: 'tab-header' },
                                        { name: 'tab-num', type: 'slot' }
                                    ]
                                }]
                            },{
                                name: 'tab-30x30 tab',
                                type: 'tab',
                                children: [{
                                    name: 'tab-wrapper',
                                    type: 'tab-wrapper',
                                    children: [
                                        { name: 'tab-header', type: 'tab-header' },
                                        { name: 'tab-num', type: 'slot' }
                                    ]
                                }]
                            }
                        ]
                    }, {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            { name: 'slot-15x30-double slot', type: 'slot' },
                            { name: 'slot-15x30-double slot', type: 'slot' },
                            { name: 'slot-15x30-double slot', type: 'slot' },
                            { name: 'slot-15x30-double slot', type: 'slot' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        slotcount: 7,
        class: [
            {
                name: 'v-wrapper w-100',
                type: 'slot-wrapper',
                children: [
                    {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            {
                                name: 'tab-30x30 tab',
                                type: 'tab',
                                children: [{
                                    name: 'tab-wrapper',
                                    type: 'tab-wrapper',
                                    children: [
                                        { name: 'tab-header', type: 'tab-header' },
                                        { name: 'tab-num', type: 'slot' }
                                    ]
                                }]
                            },{
                                name: 'tab-30x30 tab',
                                type: 'tab',
                                children: [{
                                    name: 'tab-wrapper',
                                    type: 'tab-wrapper',
                                    children: [
                                        { name: 'tab-header', type: 'tab-header' },
                                        { name: 'tab-num', type: 'slot' }
                                    ]
                                }]
                            }
                        ]
                    }, {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            { name: 'slot-12x30 slot', type: 'slot' },
                            { name: 'slot-12x30 slot', type: 'slot' },
                            { name: 'slot-12x30 slot', type: 'slot' },
                            { name: 'slot-12x30 slot', type: 'slot' },
                            { name: 'slot-12x30 slot', type: 'slot' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        slotcount: 5,
        class: [
            {
                name: 'v-wrapper w-100',
                type: 'slot-wrapper',
                children: [
                    {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            { name: 'slot-20x30 slot', type: 'slot' },
                            { name: 'slot-20x30 slot', type: 'slot' },
                            { name: 'slot-20x30 slot', type: 'slot' }
                        ]
                    }, {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            {
                                name: 'tab-30x30 tab',
                                type: 'tab',
                                children: [{
                                    name: 'tab-wrapper',
                                    type: 'tab-wrapper',
                                    children: [
                                        { name: 'tab-header', type: 'tab-header' },
                                        { name: 'tab-num', type: 'slot' }
                                    ]
                                }]
                            },{
                                name: 'tab-30x30 tab',
                                type: 'tab',
                                children: [{
                                    name: 'tab-wrapper',
                                    type: 'tab-wrapper',
                                    children: [
                                        { name: 'tab-header', type: 'tab-header' },
                                        { name: 'tab-num', type: 'slot' }
                                    ]
                                }]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        slotcount: 6,
        class: [
            {
                name: 'v-wrapper w-100',
                type: 'slot-wrapper',
                children: [
                    {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            { name: 'slot-15x30-double slot', type: 'slot' },
                            { name: 'slot-15x30-double slot', type: 'slot' },
                            { name: 'slot-15x30-double slot', type: 'slot' },
                            { name: 'slot-15x30-double slot', type: 'slot' }
                        ]
                    }, {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            {
                                name: 'tab-30x30 tab',
                                type: 'tab',
                                children: [{
                                    name: 'tab-wrapper',
                                    type: 'tab-wrapper',
                                    children: [
                                        { name: 'tab-header', type: 'tab-header' },
                                        { name: 'tab-num', type: 'slot' }
                                    ]
                                }]
                            },{
                                name: 'tab-30x30 tab',
                                type: 'tab',
                                children: [{
                                    name: 'tab-wrapper',
                                    type: 'tab-wrapper',
                                    children: [
                                        { name: 'tab-header', type: 'tab-header' },
                                        { name: 'tab-num', type: 'slot' }
                                    ]
                                }]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        slotcount: 7,
        class: [
            {
                name: 'v-wrapper w-100',
                type: 'slot-wrapper',
                children: [
                    {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            { name: 'slot-12x30 slot', type: 'slot' },
                            { name: 'slot-12x30 slot', type: 'slot' },
                            { name: 'slot-12x30 slot', type: 'slot' },
                            { name: 'slot-12x30 slot', type: 'slot' },
                            { name: 'slot-12x30 slot', type: 'slot' }
                        ]
                    }, {
                        name: 'h-wrapper',
                        type: 'slot-wrapper',
                        children: [
                            {
                                name: 'tab-30x30 tab',
                                type: 'tab',
                                children: [{
                                    name: 'tab-wrapper',
                                    type: 'tab-wrapper',
                                    children: [
                                        { name: 'tab-header', type: 'tab-header' },
                                        { name: 'tab-num', type: 'slot' }
                                    ]
                                }]
                            },{
                                name: 'tab-30x30 tab',
                                type: 'tab',
                                children: [{
                                    name: 'tab-wrapper',
                                    type: 'tab-wrapper',
                                    children: [
                                        { name: 'tab-header', type: 'tab-header' },
                                        { name: 'tab-num', type: 'slot' }
                                    ]
                                }]
                            }
                        ]
                    }
                ]
            }
        ]
    },
];

// global Layout variable.
export const Layouts = [
    { idx: 0, name: "oneByOne", text: "① 1 x 1, [1K]", },
    { idx: 3, name: "twoByOne", text: "② 2 x 1, [1K]", },
    { idx: 6, name: "oneByTwo", text: "② 1 x 2, [1K]", },
    { idx: 15, name: "twoByTwo", text: "④ 2 x 2, [2K]", },
    { idx: 1, name: "43tab_1slot", text: "② 2 x 1 (3:1), [1K]", },
    { idx: 2, name: "53tab_1slot", text: "② 2 x 1 (3:2), [1K]", },
    { idx: 4, name: "1slot_52tab", text: "② 2 x 1 (2:3), [1K]", },
    { idx: 5, name: "1slot_43tab", text: "② 2 x 1 (1:3), [1K]", },
    { idx: 7, name: "43tab_2slot", text: "③ 1 x 1 | 1 x 2 (3:1), [2K]", },
    { idx: 8, name: "53tab_2slot", text: "③ 1 x 1 | 1 x 2 (3:2), [2K]", },
    { idx: 9, name: "21tab_2tab", text: "③ 1 x 1 | 1 x 2, [2K]", },
    { idx: 12, name: "2tab_21tab", text: "③ 1 x 2 | 1 x 1, [2K]", },
    { idx: 11, name: "2slot_53tab", text: "③ 1 x 2 | 1 x 1 (2:3), [2K]", },
    { idx: 10, name: "2slot_43tab", text: "③ 1 x 2 | 1 x 1 (1:3), [2K]", },
    { idx: 13, name: "2tab-1tab", text: "③ 2 x 1 / 1 x 1, [2K]", },
    { idx: 14, name: "1tab-2tab", text: "③ 1 x 1 / 2 x 1, [2K]", },
    { idx: 16, name: "twoByThree", text: "⑥ 2 x 3, [4K]", },
    { idx: 17, name: "threeByTwo", text: "⑥ 3 x 2, [4K]", },
    { idx: 18, name: "threeByThree", text: "⑨ 3 x 3, [4K]", },
    { idx: 19, name: "43tab_3slot", text: "④ 1 x 1 | 3 x 1 (3:1), [4K]", },
    { idx: 20, name: "53tab_3slot", text: "④ 1 x 1 | 3 x 1 (3:2), [4K]", },
    { idx: 21, name: "21tab_3slot", text: "④ 1 x 1 | 3 x 1, [4K]", },
    { idx: 22, name: "3slot_21tab", text: "④ 3 x 1 | 1 x 1, [4K]", },
    { idx: 23, name: "3slot_53tab", text: "④ 3 x 1 | 1 x 1, (2:3) [4K]", },
    { idx: 24, name: "3slot_43tab", text: "④ 3 x 1 | 1 x 1, (1:3) [4K]", },
    { idx: 25, name: "21tab_21slot", text: "③ 1 x 1 | 2 x 1, [2K]", },
    { idx: 26, name: "21slot_21tab", text: "③ 2 x 1 | 1 x 1, [2K]", },
    { idx: 27, name: "21tab_22slot", text: "⑤ 1 x 1 | 2 x 2, [4K]", },
    { idx: 28, name: "22slot_21tab", text: "⑤ 2 x 2 | 1 x 1, [4K]", },
    { idx: 29, name: "threeByOne", text: "③ 3 x 1, [2K]", },
    { idx: 30, name: "fourByOne", text: "④ 4 x 1, [2K]", },
    { idx: 31, name: "fourByTwo", text: "⑧ 4 x 2, [4K]", },
    { idx: 32, name: "fiveByTwo", text: "⑩ 5 x 2, [5K]", },
    { idx: 33, name: "1tab-3slot", text: "⑩ 1 x 1 / 3 x 1, [2K]", },
    { idx: 34, name: "1tab-4slot", text: "⑤ 1 x 1 / 4 x 1, [4K]", },
    { idx: 35, name: "1tab-5slot", text: "⑤ 1 x 1 / 5 x 1, [4K]", },
    { idx: 36, name: "3slot-1tab", text: "⑩ 3 x 1 / 1 x 1, [2K]", },
    { idx: 37, name: "4slot-1tab", text: "⑤ 4 x 1 / 1 x 1, [4K]", },
    { idx: 38, name: "5slot-1tab", text: "⑤ 5 x 1 / 1 x 1, [4K]", },
    { idx: 39, name: "2tab-3slot", text: "⑤ 2 x 1 / 3 x 1, [2K]", },
    { idx: 40, name: "2tab-4slot", text: "⑥ 2 x 1 / 4 x 1, [4K]", },
    { idx: 41, name: "2tab-5slot", text: "⑦ 2 x 1 / 5 x 1, [4K]", },
    { idx: 42, name: "3slot-2tab", text: "⑤ 3 x 1 / 2 x 1, [2K]", },
    { idx: 43, name: "4slot-2tab", text: "⑥ 4 x 1 / 2 x 1, [4K]", },
    { idx: 44, name: "5slot-2tab", text: "⑦ 5 x 1 / 2 x 1, [4K]", },
];

// get slotcount of layout
export function getSlotCount(layoutId) {
    return _layouts[Layouts[layoutId].idx].slotcount;
}

// make div for slotcount( layout : layout, num : slotIndex + 1, dottedFlag : border style, showCloseFlag : close )
export function insertDivSection(layout, num, options) {
    options = { dottedFlag: 0, showCloseFlag: 0, dragFalg: 0, scaleX: 1, scaleY: 1, ...options }
    const border2 = `border-bottom-width:${2*options.scaleY}px; border-top-width:${2*options.scaleY}px; border-left-width:${2*options.scaleX}px; border-right-width:${2*options.scaleX}px;`
    switch (layout.type) {
        case 'slot': {
            const dashed = (options.dottedFlag === 1 && layout.name.substr(0, 4) === "slot") ? `border-style:dashed; ` : ``
            const style = ((layout.name.substr(0, 4) === "slot") ? border2 : ``) + dashed;
            const closeButton = (options.showCloseFlag === 1) ? ` <div class="close slot-close" style="transform: scaleX(${options.scaleX}) scaleY(${options.scaleY})">x</div>` : ``;
            return {
                html: `<div class="${layout.name}" style="${style}"><div ${num === '' ? '' : 'id="slot_' + num + '"'} class="slot-num" ${options.dragFlag ? 'draggable=true' : ''} ` +
                    `>${num === '' ? '&nbsp' : num}</div>` + closeButton + `</div>`,
                count: 1
            }
        }
        case 'tab-header':
            return {
                html: `<div class="${layout.name}"></div>`,
                count: 0
            }
        case 'tab': {
            let dashed = (options.dottedFlag === 1) ? `border-style:dashed; ` : ``
            let res = {
                html: `<div class="${layout.name}" style="${dashed + border2}">`,
                count: 1
            }
            layout.children.forEach(lay => {
                res.html += insertDivSection(lay, num, options).html;
            });
            res.html += `</div>`;
            return res;
        }
        default: {
            let res = {
                html: `<div class="${layout.name}">`,
                count: 0
            }

            layout.children.forEach(lay => {
                const rlt = insertDivSection(lay, (num == '') ? '' : num + res.count, options);
                res.html += rlt.html;
                res.count += rlt.count;
            });
            res.html += `</div>`;
            return res;
        }
    }
}

// get ordered name
export function getOrderName(count) {
    const orders = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];

    if(count < 10) {
        return orders[count];
    }

    return (count + 1) + 'th';
}

//sorts an array using one if it's keys
export function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key];
        var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

export function descSortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key];
        var y = b[key];
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
}

// check two array are equal
export function compareArray(arr1, arr2) {
    // Check if the arrays have the same length
    if (arr1.length !== arr2.length) {
      return false;
    }

    // Compare each element of the arrays
    return arr1.every((element, index) => element === arr2[index]);
}

// check two rect is same
export function compareRect(rect1, rect2) {
    return  rect1.left === rect2.left && rect1.top === rect2.top &&
            rect1.width === rect2.width && rect1.height === rect2.height;
}

// check url is valid for applying FLiK
export function isRestricedUrl(url) {
    for (let i = 0; i < restricted_urls.length; i++){
        if (url.includes(restricted_urls[i])){
            return true;
        }
    }
    return false;
}

// truncate string
export function strtrunc(str, max, add) {
    add = add || '...';
    return (typeof str === 'string' && str.length > max ? str.substring(0, max) + add : str);
}

// set slot as Embeded
export function addEmbededClass(element) {
    let tab_type = element.parentNode.className.substr(0, 3);
    let targetNode = (tab_type === "slo") ? element.parentNode : element.parentNode.parentNode.parentNode;
    targetNode.classList.add("embeded");
    targetNode.style.borderStyle = "solid";
}

// set slot as selected
export function setSelectedSlot(element) {
    let tab_type = element.parentNode.className.substr(0, 3);
    let targetNode = (tab_type === "slo") ? element.parentNode : element.parentNode.parentNode.parentNode;
    targetNode.classList.add("swap_selected");
}

// set slot as empty
export function refreshSlotState(element, embeded) {
    let tab_type = element.parentNode.className.substr(0, 3);
    let targetNode = (tab_type === "slo") ? element.parentNode : element.parentNode.parentNode.parentNode;
    if (embeded) {
        targetNode.classList.add("embeded");
        targetNode.style.borderStyle = "solid";
    } else {
        targetNode.classList.remove("embeded");
        targetNode.style.borderStyle = "dashed";
    }

    targetNode.style.borderColor = "#5E5E5E";
}

// get monitor configuration flag
export const getMonitorConfigurationFlag = async () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["monitorConfigFlag"], function ({monitorConfigFlag}) {
            resolve(monitorConfigFlag);
        });
    });
}

// set monitor configuration flag
export async function setMonitorConfigurationFlag(flag = true) {
    await chrome.storage.local.set({ monitorConfigFlag: flag });
}

// save monitor configuration popup window Ids
export async function setShownMonitorSetting(wIds) {
   await chrome.storage.local.set({ popwndIds: wIds });
}

// load monitor configuration popup window Ids
export function getShownMonitorSetting() {
    return new Promise(async (resolve, reject) => {
        await chrome.storage.local.get(["popwndIds"], function({popwndIds}) {
            resolve(popwndIds);
        });
    });
}

// initialize config options
export async function initSystemConfigs() {
    await chrome.storage.local.set({
        isEnable: true,
        isTraining: true,
        defaultSlot: 'off',
        myDeviceIndex: 0,       // my device index in shared profile
    });
}

// initialize flik counter
export async function initFlikCounter() {
    await chrome.storage.local.set({
        fliks: 0
    });
}

// initialize Band Info
export async function initBandInfo() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({
            bandInfoArray: [],
            showLabelInBand: true,
            showRuleInBand: true,
            showModeInBand: true,
            showDomainInBand: false,
            bandFontFamily: "SalesforceSansBold"
        }, () => {
            resolve();
        });
    });
}

// clean Band Info array
export async function clearBandInfo() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({
            bandInfoArray: [],
        }, () => {
            resolve();
        });
    });
}

// set Band Info
export async function setBandInfo(tabId, flikRule, flag = true) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["bandInfoArray"], function (result) {
            let bandInfoArray = result.bandInfoArray;
            if (!bandInfoArray) bandInfoArray = [];

            let bandInfo = {
                slot: flikRule.slot,
                banding: flikRule.banding,
                label: flikRule.label,
                color: flikRule.color,
                mode: flikRule.mode,
                rule: flikRule.rule
            }

            const info = bandInfoArray.find(item => item.tabId === tabId);
            if(info) {
                info.bandInfo = bandInfo;
                info.flagToShow = flag;           // flag to prevent rebanding
            } else {
                bandInfoArray.push({ tabId, bandInfo, flagToShow: flag });
            }

            chrome.storage.local.set({ bandInfoArray }, () => {
                resolve(bandInfo);
            });
        });
    });
}

// release Band Info
export async function releaseBandInfo(tabId) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["bandInfoArray"], function ({bandInfoArray}) {
            for (var i = 0; i < bandInfoArray.length; i++){
                if (bandInfoArray[i].tabId === tabId) {
                    bandInfoArray[i].flagToShow = false;           // flag to prevent rebanding
                    break;
                }
            }

            chrome.storage.local.set({ bandInfoArray }, () => {
                resolve();
            });
        });
    });
}

// remove Band Info
export async function removeBandInfo(tabId) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["bandInfoArray"], function ({ bandInfoArray }) {
            if (!bandInfoArray) return;
            for (var i = 0; i < bandInfoArray.length; i++){
                if (bandInfoArray[i].tabId === tabId) {
                    bandInfoArray.splice(i, 1);
                    break;
                }
            }

            if (i < bandInfoArray.length) {
                chrome.storage.local.set({ bandInfoArray }, () => {
                    resolve(true);
                });
            } else {
               resolve(false);
            }
        });
    });
}

// insert Band
export function insertBand(bandInfo, config = {showLabelInBand:true, showRuleInBand:true, showModeInBand:true, showDomainInBand:true, bandFontFamily : "SalesforceSansBold"}) {
    const bandKeepTime = 5000; // time for banding fade effect (unit : ms)
    const bandFadeTime = 5000; // time for banding fade effect (unit : ms)

    var bandInfo = bandInfo;
    if (bandInfo.banding === "No banding") return;

    var bandDiv = document.createElement("div");
    bandDiv.setAttribute("id", "FLiK_Band");
    bandDiv.style.top = window.innerHeight * 0.35 + "px";
    bandDiv.style.backgroundColor = bandInfo.color + "50";
    bandDiv.style.fontFamily = config.bandFontFamily;
    bandDiv.style.color = bandInfo.color;
    bandDiv.style.minHeight = 100 + "px";

    let bandLabelHeight = parseInt(window.innerHeight * 0.25);
    let strHtml = `<img class='BandLogo' src='${chrome.runtime.getURL('img/icon128_transparent.png')}'></img>`
    if (config.showLabelInBand) {
        const hosts =window.location.hostname.split('.');
        let domain = "";
        if(hosts[0] != "www"){
            domain = hosts[0];
        }else{
            hosts.length >0 ? domain =hosts[1] : domain="";
        }
        strHtml += `<div class='BandText' style='font-size:${parseInt(bandLabelHeight * 0.5)}px; height:${bandLabelHeight}px; line-height:${bandLabelHeight}px;'>${config.showDomainInBand ? domain : bandInfo.label}</div>`
    }

    let bandRuleHeight = parseInt(bandLabelHeight * 0.2);
    if (config.showModeInBand) {
        let strMode = "Mode: ";
        switch (bandInfo.mode) {
            case 'Flik':
                strMode += "FLiK rule";
                break;
            case 'Tied':
                strMode += "Already tied";
                break;
            case 'Position':
                strMode += "Position matched";
                break;
            case 'Target':
                strMode += "Targeted";
                break;
            case 'ReceivedFromDevice':
                strMode += "Received from device";
                break;
        }
        strHtml += `<div class='BandMode' style='font-size:${parseInt(bandRuleHeight*0.8)}px; height:${bandRuleHeight}px; line-height:${bandRuleHeight}px;'>${strMode}</div>`
    }

    if (config.showRuleInBand) {
        const strRule = "Rule: " + bandInfo.rule;
        strHtml += `<div class='BandMode' style='font-size:${parseInt(bandRuleHeight*0.8)}px; height:${bandRuleHeight}px; line-height:${bandRuleHeight}px;'>${strRule}</div>`
    }

    bandDiv.innerHTML = strHtml;

    const prevDiv = document.getElementById("FLiK_Band");
    const body = document.body;
    if (prevDiv) {
        body.removeChild(prevDiv);
    }
    body.append(bandDiv);

    switch (bandInfo.banding) {
        case "Show & fade": {
            var bandOpacity = 1;
            setTimeout((t) => {
                var timerID = setInterval((t) => {
                    if (bandDiv) {
                        bandOpacity *= 0.922;
                        bandDiv.style.opacity = bandOpacity;
                    } else {
                        clearInterval(timerID);
                    }

                    if (bandOpacity <= 0.2) {
                        clearInterval(timerID);
                        removeBandInterface();
                    }
                }, parseInt(bandFadeTime / 20))
            }, bandKeepTime);

            break;
        }
        case "Show until active":
            setTimeout(() => { showBandInterface(); }, 100)
            break;
        case "Show when inactive":
            hideBandInterface();
            break;
    }

    // band click event
    bandDiv.addEventListener("click", (e) => {
        removeBandInterface();
    })

    // acrivated event
    window.onfocus = function () {
        if (!bandDiv) return;
        if (bandInfo.banding === "Show when inactive") {
            setTimeout(() => { hideBandInterface(); }, 100)
        } else if (bandInfo.banding === "Show until active") {
            showBandInterface();
        }
    }

    // inactivated event
    window.onblur = function() {
        if (!bandDiv) return;
        if (bandInfo.banding === "Show until active") {
            hideBandInterface();
        } else if (bandInfo.banding === "Show when inactive") {
            showBandInterface();
        }
    }

    function removeBandInterface() {
        if (bandDiv && bandDiv.parentNode) {
            bandDiv.parentNode.removeChild(bandDiv);
            bandDiv = null;
        }
    }

    function showBandInterface() {
        if (bandDiv) {
            bandDiv.style.display = null;
        }
    }

    function hideBandInterface() {
        if (bandDiv) {
            bandDiv.style.display = "none";
        }
    }
}

// initialize Notify Info
export async function initNotifyInfo() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({
            notifyWndLeftPos: null,
            notifyWndTopPos: null,
            autoHideNotify: true,
            notifyDuration: 5, // seconds
        }, () => {
            resolve();
        });
    });
}

// clear only Notify window Info
export async function clearNotifyWindowInfo() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({
            notifyWndLeftPos: null,
            notifyWndTopPos: null,
        }, () => {
            resolve();
        });
    });
}

// initialize Account Info
export async function initAccountInfo() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({
            accountName: null,
            accountEmail: null,
            accountId: null,
            accountPassword: null,
            accountToken: null,
            refreshToken: null,
            accountChangedFlag: true,
        }, () => {
            resolve();
        });
    });
}

// erase  Account info
export async function cleanAccountInfo() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["accountChangedFlag"], function ({ accountChangedFlag }) {
            chrome.storage.local.set({
                accountName: null,
                accountEmail: null,
                accountId: null,
                accountPassword: null,
                accountToken: null,
                refreshToken: null,
                accountChangedFlag: !accountChangedFlag,
        }, () => {
                resolve();
            });
        })
    });
}

// save Account Info
export async function saveAccountInfo(info) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["accountChangedFlag"], function ({ accountChangedFlag }) {
            chrome.storage.local.set({
                accountName: info.name,
                accountEmail: info.email,
                accountId: info.uuid,
                accountPassword: info.password,
                accountToken: info.accessToken,
                refreshToken: info.refreshToken,
                accountChangedFlag: !accountChangedFlag,
        }, () => {
                console.log("AccountInfo is saved.");
                resolve();
            });
        })
    });
}

// get Account Info
export async function getAccountInfo() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["accountId", "accountEmail", "accountName", "accountPassword", "accessToken", "refreshToken" ], function (info) {
            resolve(info);
        });
    });
}

// get Account Id
export async function getAccountId() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["accountId" ], function ({accountId}) {
            resolve(accountId);
        });
    });
}

// set Account Id
export async function cleanAccountId() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({accountId: null}, () => {
            resolve();
        })
    });
}

// get refresh token
export async function getRefreshToken() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["refreshToken" ], function ({refreshToken}) {
            resolve(refreshToken);
        });
    });
}

export async function savePwd(password) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({
            tempPwd: password,
        }, () => {
            resolve();
        })
    });
}

export async function getPwd() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["tempPwd"], function (pwd) {
            resolve(pwd);
        });
    });
}

// init flikUser list
export async function initFlikUserlist() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({
            flikUserArray: null,
            flikUsersFlag: true,
        }, () => {
            resolve();
        });
    });
}

// save User lists
export async function saveFlikUserlist(infoArray) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["flikUsersFlag"], function ({ flikUsersFlag }) {
            chrome.storage.local.set({
                flikUserArray: infoArray,
                flikUsersFlag: !flikUsersFlag,
        }, () => {
                resolve();
            });
        })
    });
}

// get Userlists
export async function getFlikUserlist() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["flikUserArray"], function (info) {
            resolve(info.flikUserArray);
        });
    });
}

// check url is valid
export function isValidUrl(urlString){
    var urlPattern = new RegExp('^(https?:\\/\\/)?'+        // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+                      // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+                  // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+                         // validate query string
        '(\\#[-a-z\\d_]*)?$','i');                          // validate fragment locator
    return !!urlPattern.test(urlString);
}

// check url is matched
// 0 : nomatch, 1: exact, 2: submatch
export function isMatched(url, baseUrl) {
    if (baseUrl === url) {
        return 1;
    }

    const domain = url.split('/')[0];
    if (baseUrl === domain) {
        return 2;
    }

    const subTokens = domain.split(".");
    if (subTokens.length > 2) {
        let subDomain = domain.substr(subTokens[0].length + 1);
        if (baseUrl === subDomain) {
            return 2;
        }
    }

    return 0;
}

// remove url prefix such as https://, http://, www.
export function removeUrlPrefix(url) {
    if (url.substr(0, 8) === 'https://') {
        url = url.substr(8);
    }

    if (url.substr(0, 7) === 'http://') {
        url = url.substr(7);
    }

    if (url.substr(0, 4) === 'www.') {
        url = url.substr(4);
    }

    return url;
}

// close popup windows
export async function closeAllPopups() {
    const windows = await chrome.windows.getAll({ populate: true, windowTypes: ['popup'] });
    for (const window of windows) {
        if (window.tabs[0].url.indexOf(chrome.runtime.id) !== -1) {
            chrome.windows.remove(window.id);
        }
    }
}

// add window count indicator in slots
export function drawWndCountsInSlot(domID, slotInfo) {
    $(`#${domID} .slot-num-wrapper`).remove();

    document.querySelectorAll(`#${domID} .slot-num`).forEach(async (item) => {
        let slotNum = parseInt(item.getAttribute("id").substring(5));
        let windowsCount = slotInfo[slotNum];
        if (windowsCount > 0) {
            let strDiv = "";
            const strIndicatorDiv = '<div class="slot-num-indicator"></div>';
            strDiv += strIndicatorDiv;
            if (windowsCount > 2) {
                strDiv += strIndicatorDiv;
            }
            if (windowsCount > 4) {
                strDiv += strIndicatorDiv;
            }

            let ele = document.createElement('div');
            ele.classList.add('slot-num-wrapper');
            ele.setAttribute('title', `${windowsCount > 4 ? 'High' : windowsCount > 2 ? 'Medium' : 'Low'} frequency usage`);
            ele.innerHTML = strDiv;
            item.appendChild(ele);
        }
    });
}

// generate device Id
export async function generateDeviceId() {
    let uuid = '', i, random;
    for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;
        if (i === 8 || i === 12 || i === 16 || i === 20) {
            uuid += '-';
        }
        uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
    }

    await chrome.storage.local.set({ myDeviceId: uuid });
    return uuid;
}

// set device Id
export async function setMyDeviceId(deviceId) {
    await chrome.storage.local.set({ myDeviceId: deviceId });
}

// get device Id
export async function loadMyDeviceId() {
    const { myDeviceId } = await chrome.storage.local.get(["myDeviceId"]);
    return myDeviceId;
}

// get sender Id
export async function loadSenderId() {
    const { senderId } = await chrome.storage.local.get(["senderId"]);
    return senderId;
}

// save my device Index
export async function saveMyDeviceIndex(myDeviceIndex) {
    await chrome.storage.local.set({ myDeviceIndex });
}

// get my device Index
export async function loadMyDeviceIndex() {
    const { myDeviceIndex } = await chrome.storage.local.get(["myDeviceIndex"]);
    return myDeviceIndex;
}

// save slot linking notification
export async function setFlikReceivedFlag(url, slotIndex, senderDevicdId) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["flikReceivedFlag"], function ({ flikReceivedFlag }) {
            chrome.storage.local.set({
                flikReceivedFlag: !flikReceivedFlag,
                received_url: url,
                received_slotIndex: slotIndex,
                flik_sender_deviceId: senderDevicdId,
            }, () => {
                resolve();
            });
        })
    });
}

//save slot linking notification by portal
export async function setSlotNotificationByPortal(url, sender) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["persistSlotByPortalFlag"], function ({ persistSlotByPortalFlag }) {
            chrome.storage.local.set({
                persistSlotByPortalFlag: !persistSlotByPortalFlag,
                received_url: url,
                portalsender: sender,
            }, () => {
                console.log("SlotNotificationByPortal is saved.",url);
                resolve();
            });
        })
    });
}

// set the flag device data is changed by server
export async function setDeviceChangedByServer(flag = true) {
    await chrome.storage.local.set({ deviceChangedByServer: flag });
}

// get the flag device data is changed by server
export async function getDeviceChangedByServer() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["deviceChangedByServer"], function ({deviceChangedByServer}) {
            resolve(deviceChangedByServer);
        });
    });
}

// set the flag device data is deleted by server
export async function setDeviceDeletedByServer(flag = true) {
    await chrome.storage.local.set({ deviceRemovedByServer: flag });
}

// set the flag the rule is changed by server
export async function setRuleChangedByServer(flag = true) {
    await chrome.storage.local.set({ ruleChangedByServer: flag });
}

// get the flag the rule is changed by server
export async function getRuleChangedByServer() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["ruleChangedByServer"], function ({ruleChangedByServer}) {
            resolve(ruleChangedByServer);
        });
    });
}

// set the flag to allow offline version
export async function setOfflineFlag(flag = true) {
    await chrome.storage.local.set({ offlineFlag: flag });
}

// get the flag to allow offline version
export async function getOfflineFlag() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["offlineFlag"], function ({offlineFlag}) {
            resolve(offlineFlag);
        });
    });
}

// set the flag to lock edit
export async function setLockFlag(flag = true) {
    await chrome.storage.local.set({ lockFlag: flag });
}

// get the flag to lock edit
export async function getLockFlag() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["lockFlag"], function ({lockFlag}) {
            resolve(lockFlag);
        });
    });
}

// set the flag to lock edit
export async function setLockedAt(locked_time) {
    await chrome.storage.local.set({ lockedAt: locked_time });
}

// set the device name of locker
export async function setEditLocker(deviceId = "", note = "") {
    await chrome.storage.local.set({ editLocker: deviceId, editLockerNote: note });
}

// get the device name of locker
export async function getEditLocker() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["editLocker", "editLockerNote"], function ({editLocker, editLockerNote}) {
            resolve({editLocker, editLockerNote});
        });
    });
}

// set the pending time
export async function setPendingTime(seconds = 30) {
    await chrome.storage.local.set({ pendingTime: seconds });
}

// get the pending time
export async function getPendingTime() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["pendingTime"], function ({pendingTime}) {
            resolve(parseInt(pendingTime));
        });
    });
}

// set default monitor ordering
export async function setDefaultMonitorOrdering(ordering) {
    await chrome.storage.local.set({ defaultMonitorOrdering: ordering });
}

// get default monitor ordering
export async function getDefaultMonitorOrdering() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["defaultMonitorOrdering"], function ({defaultMonitorOrdering}) {
            resolve(defaultMonitorOrdering);
        });
    });
}

export function getTime(data){
    return new Date(data).getTime();
}

export function getDiffSeconds(date1, date2){
    return (date1 - date2) / 1000;
}

export function convertElapsedTime(seconds) {
    if(seconds < 0) seconds = 0;
    if(seconds == 0) return " - : - : - ";
    const h = Math.trunc(seconds  / 3600).toString().padStart(2, '0');
    const m = Math.trunc((seconds - h * 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds - h * 3600 - m * 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

// get current datetime
export function getUtcTime(date = new Date()){
    return `${date.getUTCFullYear()}-${(date.getUTCMonth()+1)}-${date.getUTCDate()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`;
}

export function getLocalTime(utc = new Date()) {
    return `${utc.getFullYear()}-${(utc.getMonth()+1)}-${utc.getDate()} ${utc.getHours()}:${utc.getMinutes()}:${utc.getSeconds()}`;
}

export function subtractDateTimes(dt1 = new Date(), second){
    let dt =new Date(dt1.getTime() - second * 1000);
    return  Date.parse(getUtcTime(dt));
}

// init logs
export async function initLogs() {
    await chrome.storage.local.set({ eventLogs: [] });
}

export async function addLog(log) {
    const result = await chrome.storage.local.get({ eventLogs: [] });
    let logs = result.eventLogs;
    logs.push(log);
    await chrome.storage.local.set({ eventLogs: logs });
}

// get logs
export async function getLogs() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["eventLogs"], function ({eventLogs}) {
            resolve(eventLogs);
        });
    });
}