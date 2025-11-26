 import {create} from 'zustand';
import { persist, createJSONStorage } from "zustand/middleware";
import type { VentState } from '../types/vent';

const ventStore=(set,get): VentState=>({

    post:"",
    company_id:"",
    category:null,
    selectedMedia: null,
    mediaType: "",
    scrollSkip:0,
    scrollLoading : true,
    scrollLoadinMore: false,
    scrollCategory: "",
    scrollHasMore : true,
    scrollToItem: null,
    vents:[],
    refreshButton: false,
   
    setRefreshButton : (data)=>{
        set(({
            refreshButton: data
        }))
    },
    addScrollSkip : (data)=>{
        set(({
            scrollSkip: data
        }))
    },
    addScrollLoading : (data)=>{
        set(({
            scrollLoading: data
        }))
    },
    addScrollLoadingMore:(data)=>{
        set(({
            scrollLoadinMore: data
        }))
    },
    addScrollCategory:(data)=>{
        set(({
            scrollCategory: data
        }))
    },
    addHasMore: (data)=>{
        set(({
            scrollHasMore : data,
        }))
    },
    addScrollToItem: (data)=>{
        set(({
            scrollToItem : data,
        }))
    },
    addVents:(data)=>{
        set((state)=>({
                vents:[...state.vents, ...data]
        }));
    },
    addVent:(data)=>{
        set((state)=>({
            vents:[data,...state.vents]
        }))
    },
    addTrendingVent:(data)=>{
        set((state)=>({
            vents:[...state.vents, data]
        }))
    },
    addPost:(data)=>{
        set({
            post:data
        });
    },
    addCategory:(data)=>{
        set({
            category: data
        });
    },
    addCompany_id:(data)=>{
        set({
            company_id: data
        });
    },
    addSelectedMedia:(data)=>{
        set({
            selectedMedia:data
        });
    },
    addMediaType:(data)=>{
        set({
            mediaType: data
        })
    },
upVote: (id, user_id, votedata) => {
    const vents = get().vents;
    const updatedVents = vents.map((vent) => {
        if (vent.id === id) {
            
            // 1. Find the existing vote for the current user
            const existingVote = vent.votes.find(
                (vote) => vote.user_id === user_id
            );
            const currentVoteStatus = existingVote ? existingVote.vote : 'NOVOTE';
            
            // Initializing count adjustments
            let upvoteChange = 0;
            let downvoteChange = 0;
            
            // --- Logic for when the new vote is 'NOVOTE' (Undoing an UPVOTE) ---
            if (votedata.vote === 'NOVOTE'){
                if (currentVoteStatus === 'UPVOTE') {
                    upvoteChange = -1; // Decrement upvote count
                }
                
                return {
                    ...vent,
                    upvote: Number(vent.upvote) + upvoteChange,
                    downvote: Number(vent.downvote), // No change to downvote count
                    votes: vent.votes.map((vote)=>{
                        if( vote.user_id === user_id){
                            return{
                                ...vote,
                                vote:'NOVOTE'
                            }
                        }
                        return vote
                    })
                };
            
            // --- Logic for when the new vote is 'UPVOTE' ---
            } else if (votedata.vote === 'UPVOTE'){
                // If already UPVOTE, we do nothing to the counter (this prevents spamming issue)
                if (currentVoteStatus === 'UPVOTE') {
                    upvoteChange = 0;
                    downvoteChange = 0; // The client-side should ideally prevent the call in this case (vote === 'UPVOTE' && voteenum === 'NOVOTE'), but this provides a safeguard.
                } else if (currentVoteStatus === 'DOWNVOTE') {
                    upvoteChange = 1; // Change from DOWNVOTE to UPVOTE
                    downvoteChange = -1; // Decrement downvote count
                } else if (currentVoteStatus === 'NOVOTE') {
                    upvoteChange = 1; // Change from NOVOTE to UPVOTE
                    downvoteChange = 0;
                }

                return{
                    ...vent,
                    upvote: Number(vent.upvote) + upvoteChange,
                    downvote: Number(vent.downvote) + downvoteChange,
                    votes: (() => {
                        let userFound = false;
                        const updatedVotes = vent.votes.map((vote) => {
                            if( vote.user_id === user_id){
                                userFound = true;
                                return{
                                    ...vote,
                                    vote:'UPVOTE'
                                }
                            }
                            return vote
                        });
                        
                        if (!userFound) {
                            // Only add the new vote if the user didn't have any vote yet
                            return [...updatedVotes, votedata];
                        }
                        return updatedVotes;
                    })()
                }
            }
        }
        return vent;
    });
    set({ vents: updatedVents });
},
downVote: (id, user_id, votedata) => {
        const vents = get().vents;
            const updatedVents = vents.map((vent) => {
                if (vent.id === id) {
                    if (votedata.vote ==='NOVOTE'){
                        return {
                            ...vent,
                            downvote: Number(vent.downvote) - 1,
                            votes: vent.votes.map((vote)=>{
                                if( vote.user_id === user_id){
                                    return{
                                        ...vote,
                                        vote:'NOVOTE'
                                    }
                                }
                                return vote
                            })
                        };
                    }else if (votedata.vote === 'DOWNVOTE'){
                                                const existUpVote = vent.votes.find(
                                (vote) => vote.user_id === user_id && vote.vote === 'UPVOTE'
                            );

                        return{
                            ...vent,
                            downvote: Number(vent.downvote) + 1,
                            upvote: existUpVote ? Number(vent.upvote) - 1 : Number(vent.upvote),
                            votes: (() => {
                                let userFound = false;
                                const updatedVotes = vent.votes.map((vote) => {
                                    if( vote.user_id === user_id){
                                        userFound = true;
                                        return{
                                            ...vote,
                                            vote:'DOWNVOTE'
                                        }
                                    }
                                    return vote
                                });
                                
                                if (!userFound) {
                                    return [...updatedVotes, votedata];
                                }
                                return updatedVotes;
                            })()
                        }
                    }
                }
                return vent;
            });
                
            set({ vents: updatedVents });
            },
    getVent:(id : string)=>{
        const vents = get().vents;
        return vents.find((vent) => vent.id === Number(id)) || null;
    },
    deleteVent:(id: string)=>{
        const vents= get().vents;
        const updatedVents = vents.filter((vent => vent.id != id));
        set({
            vents: updatedVents
        })
    },
    resetScrollLoading:()=>{
        set({
            scrollLoading : true,
        })
    },
    resetScrollLoadingMore:()=>{
        set({
            scrollLoadinMore: false,
        })
    },
    resetScrollCategory:()=>{
        set({
            scrollCategory: "",
        })
    },
    resetScrollSkip:()=>{
        set({
            scrollSkip : 0,
        })
    },
    resetHasMore:()=>{
        set({
            scrollHasMore: true
        })
    },
    reset:()=>{
        set({
            vents:[]
        })
    },
    resetSelectedMedia:()=>{
        set({
            selectedMedia: null
        })
    },
    restMediaType:()=>{
        set({
            mediaType: ""
        })
    },
    resetCompany_id:()=>{
        set({
            company_id: ""
        })
    },
    resetPost:()=>{
        set({
            post: ""
        })
    },
    resetCategory:()=>{
        set({
            category: null
        })
    },
    resetScrollToItem :()=>{
        set({
            scrollToItem: null
        })
    },

    logout:()=>{
        set({
            post:"",
            company_id:"",
            category:"",
            selectedMedia: null,
            mediaType: "",
            scrollSkip:0,
            scrollLoading : true,
            scrollLoadinMore: false,
            scrollCategory: "",
            scrollHasMore : true,
            scrollToItem: null,
            vents:[]
        })
    }
})

const useVentStore=create(persist(ventStore,{
    name:"vents",
    storage: createJSONStorage(()=>sessionStorage)
}));

export default useVentStore;