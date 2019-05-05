// Design:
//
// * There are several regions in the game;
//   Sheep Stock,
//   Field,
//   Hand,
//   Deck,
//   Discard pile,
//   Exile.
// * A region contains a pile of cards.
// * A pile of cards is expressed as an array.
// * The first card in an array is corresponding to
//   the bottom card in a pile or the first card put into the pile.
// * The last card in an array is corresponding to
//   the top card in a pile or the last card put into the pile.

var shephy = {};

(function (S, $) {
  // Utilities  {{{1
  S.RANKS = [1, 3, 10, 30, 100, 300, 1000];

  function max(xs) {
    return Math.max.apply(Math, xs);
  }

  function sum(ns) {
      return ns.reduce(function (total, n) {return total + n;}, 0);
  }

  function random(n) {
    return Math.floor(Math.random() * n);
  }

  function shuffle(xs) {
    for (var i = 0; i < xs.length; i++) {
      var j = random(xs.length - i);
      var tmp = xs[i];
      xs[i] = xs[j];
      xs[j] = tmp;
    }
  }

  S.delay = function(expressionAsFunction) {
    var result;
    var isEvaluated = false;

    return function () {
      if (!isEvaluated) {
        result = expressionAsFunction();
        isEvaluated = true;
      }
      return result;
    };
  };

  S.force = function (promise) {
    return promise();
  };

  S.clone = function (x) {
    return JSON.parse(JSON.stringify(x));
  };

  S.dropRank = function (rank) {
    if (rank == 1)
      return undefined;
    var r = rank % 3;
    if (r == 0)
      return rank / 3;
    else
      return rank * 3 / 10;
  };

  S.raiseRank = function (rank) {
    if (rank == 1000)
      return undefined;
    var r = rank % 3;
    if (r == 0)
      return rank * 10 / 3;
    else
      return rank * 3;
  };

  S.compositeRanks = function (ranks) {
    var rankSum = ranks.reduce(function (ra, r) {return ra + r;});
    var candidateRanks = S.RANKS.filter(function (r) {return r <= rankSum;});
    return max(candidateRanks);
  };

  function makeSheepCard(rank) {
    return {
      name: rank + '',
      rank: rank
    };
  }

  function makeSheepStockPile(rank) {
    var cards = [];
    for (var i = 0; i < 7; i++)
      cards.push(makeSheepCard(rank));
    return cards;
  }

  function makeEventCard(name) {
    return {
      name: name
    };
  }

  function cardType(card) {
    return card.type || (card.rank === undefined ? 'event' : 'sheep');
  }

  function makeInitalDeck() {
    var names = [
      'All-purpose Sheep',
      'Be Fruitful',
      'Be Fruitful',
      'Be Fruitful',
      'Crowding',
      'Dominion',
      'Dominion',
      'Falling Rock',
      'Fill the Earth',
      'Flourish',
      'Golden Hooves',
      'Inspiration',
      'Lightning',
      'Meteor',
      'Multiply',
      'Plague',
      'Planning Sheep',
      'Sheep Dog',
      'Shephion',
      'Slump',
      'Storm',
      'Wolves'
    ];
    var cards = names.map(makeEventCard);
    shuffle(cards);
    return cards;
  }

  S.makeInitalWorld = function () {
    var sheepStock = {};
    S.RANKS.forEach(function (rank) {
      sheepStock[rank] = makeSheepStockPile(rank);
    });

    var initialSheepCard = sheepStock[1].pop();

    return {
      sheepStock: sheepStock,
      field: [initialSheepCard],
      enemySheepCount: 1,
      deck: makeInitalDeck(),
      hand: [],
      discardPile: [],
      exile: []
    };
  };

  S.gainX = function (world, rank) {
    if (world.sheepStock[rank].length == 0)
      return;
    if (7 - world.field.length <= 0)
      return;

    world.field.push(world.sheepStock[rank].pop());
  };

  S.releaseX = function (world, fieldIndex) {
    var c = world.field.splice(fieldIndex, 1)[0];
    world.sheepStock[c.rank].push(c);
  };

  S.discardX = function (world, handIndex) {
    var c = world.hand.splice(handIndex, 1)[0];
    world.discardPile.push(c);
  };

  S.exileX = function (world, region, index) {
    var c = region.splice(index, 1)[0];
    world.exile.push(c);
  };

  S.drawX = function (world) {
    if (world.deck.length == 0)
      return;
    if (5 - world.hand.length <= 0)
      return;

    world.hand.push(world.deck.pop());
  };

  S.remakeDeckX = function (world) {
    world.deck.push.apply(world.deck, world.discardPile);
    world.discardPile = [];
    shuffle(world.deck);
  };

  S.shouldDraw = function (world) {
    return world.hand.length < 5 && 0 < world.deck.length;
  };

  S.judgeGame = function (world) {
    if (world.field.some(function (c) {return c.rank == 1000;})) {
      return {
        result: 'win',
        description: 'You win!'
      };
    }
    if (world.enemySheepCount == 1000) {
      return {
        result: 'lose',
        description: 'Enemies reached 1000 sheep - you lose.'
      };
    }
    if (world.field.length == 0) {
      return {
        result: 'lose',
        description: 'You lost all your sheep - you lose.'
      };
    }

    throw 'Invalid operation';
  };

  // Move sets  {{{2
  // NB: These functions are to make code declarative, but they're destructive.

  function automated(moves) {
    moves.automated = true;
    return moves;
  }

  function described(description, moves) {
    moves.description = description;
    return moves;
  }

  function mapOn(world, regionName, moveMaker) {
    return world[regionName].map(function (c, i) {
      var move = moveMaker(c, i);
      move.cardRegion = regionName;
      move.cardIndex = i;
      return move;
    });
  }

  // Core  {{{1
  S.makeGameTree = function (world, opt_state) {  //{{{2
    return {
      world: world,
      moves: S.listPossibleMoves(world, opt_state)
    };
  };

  S.listPossibleMoves = function (world, opt_state) {  //{{{2
    if (opt_state === undefined)
      return S.listPossibleMovesForBasicRules(world);
    else
      return S.listPossibleMovesForPlayingCard(world, opt_state);
  }

  S.listPossibleMovesForBasicRules = function (world) {  //{{{2
    // TODO: Add an option to continue the current game to compete high score.
    if (world.field.some(function (c) {return c.rank == 1000;}))
      return [];

    if (1000 <= world.enemySheepCount)
      return [];

    if (world.field.length == 0)
      return [];

    if (world.hand.length == 0 && world.deck.length == 0) {
      return automated([
        {
          description: 'Remake Deck then fill Hand',
          gameTreePromise: S.delay(function () {
            var wn = S.clone(world);
            S.remakeDeckX(wn);
            while (S.shouldDraw(wn))
              S.drawX(wn);
            wn.enemySheepCount *= 10;
            return S.makeGameTree(wn);
          })
        }
      ]);
    }

    if (S.shouldDraw(world)) {
      return automated([
        {
          description:
            5 - world.hand.length == 1
            ? 'Draw a card'
            : 'Draw cards',
          gameTreePromise: S.delay(function () {
            var wn = S.clone(world);
            while (S.shouldDraw(wn))
              S.drawX(wn);
            return S.makeGameTree(wn);
          })
        }
      ]);
    }

    return described('Choose a card to play from hand',
      mapOn(world, 'hand', function (c, i) {
        return {
          description: 'Play ' + c.name,
          gameTreePromise: S.delay(function () {
            var wn = S.clone(world);
            S.discardX(wn, i);
            return S.makeGameTree(wn, {step: c.name});
          })
        };
      })
    );
  };

  S.listPossibleMovesForPlayingCard = function (world, state) {  //{{{2
    var h = cardHandlerTable[state.step] || unimplementedCardHandler;
    return h(world, state);
  };

  var cardHandlerTable = {};  //{{{2

  cardHandlerTable['All-purpose Sheep'] = function (world, state) {  //{{{2
    if (world.hand.length == 0) {
      return automated([{
        description: 'No card in hand - nothing happened',
        gameTreePromise: S.delay(function () {
          return S.makeGameTree(world);
        })
      }]);
    } else {
      return described('Choose a card to copy in hand',
        mapOn(world, 'hand', function (c, i) {
          return {
            description: 'Copy ' + c.name,
            gameTreePromise: S.delay(function () {
              return S.makeGameTree(world, {step: c.name});
            })
          };
        })
      );
    }
  };

  cardHandlerTable['Be Fruitful'] = function (world, state) {  //{{{2
    if (state.rank === undefined) {
      if (world.field.length < 7) {
        return described('Choose a card to copy in the field',
          mapOn(world, 'field', function (c) {
            return {
              description: 'Copy ' + c.rank + ' Sheep card',
              gameTreePromise: S.delay(function () {
                return S.makeGameTree(world, {step: state.step, rank: c.rank});
              })
            };
          })
        );
      } else {
        return automated([{
          description: 'Nothing happened',
          gameTreePromise: S.delay(function () {
            return S.makeGameTree(world);
          })
        }]);
      }
    } else {
      return automated([{
        description: 'Gain a ' + state.rank + ' Sheep card',
        gameTreePromise: S.delay(function () {
          var wn = S.clone(world);
          S.gainX(wn, state.rank);
          return S.makeGameTree(wn);
        })
      }]);
    }
  };

  cardHandlerTable['Crowding'] = function (world, state) {  //{{{2
    if (world.field.length <= 2) {
      return automated([{
        description: 'Too few sheep - nothing happened',
        gameTreePromise: S.delay(function () {
          return S.makeGameTree(world);
        })
      }]);
    } else {
      return described('Choose a card to release in the field',
        mapOn(world, 'field', function (c, i) {
          return {
            description: 'Release ' + c.rank + ' Sheep card',
            gameTreePromise: S.delay(function () {
              var wn = S.clone(world);
              S.releaseX(wn, i);
              var sn = wn.field.length <= 2 ? undefined : state;
              return S.makeGameTree(wn, sn);
            })
          };
        })
      );;
    }
  };

  cardHandlerTable['Dominion'] = function (world, state) {  //{{{2
    var chosenIndice = state.chosenIndice || [];
    var moves =
      mapOn(world, 'field', function (c, i) {
        return {
          description: 'Choose ' + c.rank + ' Sheep card',
          gameTreePromise: S.delay(function () {
            return S.makeGameTree(world, {
              step: state.step,
              chosenIndice: (chosenIndice || []).concat([i]).sort()
            });
          })
        };
      })
      .filter(function (m) {return chosenIndice.indexOf(m.cardIndex) == -1;});
    if (chosenIndice.length != 0) {
      moves.push({
        description: 'Combine chosen Sheep cards',
        gameTreePromise: S.delay(function () {
          var wn = S.clone(world);
          for (var i = chosenIndice.length - 1; 0 <= i; i--)
            S.releaseX(wn, chosenIndice[i]);
          S.gainX(wn, S.compositeRanks(
            chosenIndice.map(function (i) {return world.field[i].rank;})
          ));
          return S.makeGameTree(wn);
        })
      });
    }

    if (chosenIndice.length == 0)
      moves.description = 'Choose a card in the field to combine';
    else if (chosenIndice.length != world.field.length)
      moves.description = 'Choose a card in the field to combine, or';
    else
      moves.automated = true;

    return moves;
  };

  cardHandlerTable['Falling Rock'] = function (world, state) {  //{{{2
    return described('Choose a card to release in the field',
      mapOn(world, 'field', function (c, i) {
        return {
          description: 'Release ' + c.rank + ' Sheep card',
          gameTreePromise: S.delay(function () {
            var wn = S.clone(world);
            S.releaseX(wn, i);
            return S.makeGameTree(wn);
          })
        };
      })
    );
  };

  cardHandlerTable['Fill the Earth'] = function (world, state) {  //{{{2
    var moves = [];
    if (world.field.length < 7) {
      moves.description = 'Gain a 1 Sheep card, or';
      moves.push({
        description: 'Gain a 1 Sheep card',
        cardRegion: 'sheepStock1',
        cardIndex: world.sheepStock[1].length - 1,
        gameTreePromise: S.delay(function () {
          var wn = S.clone(world);
          S.gainX(wn, 1);
          return S.makeGameTree(wn, state);
        })
      });
    } else {
      moves.description = 'No space in the field';
      moves.automated = true;
    }
    moves.push({
      description: 'Cancel',
      gameTreePromise: S.delay(function () {
        return S.makeGameTree(world);
      })
    });
    return moves;
  };

  cardHandlerTable['Flourish'] = function (world, state) {  //{{{2
    if (state.rank === undefined) {
      if (world.field.length < 7) {
        return described('Choose a card in the field',
          mapOn(world, 'field', function (c) {
            return {
              description: 'Choose ' + c.rank + ' Sheep card',
              gameTreePromise: S.delay(function () {
                return S.makeGameTree(world, {step: state.step, rank: c.rank});
              })
            };
          })
        );
      } else {
        return automated([{
          description: 'Nothing happened',
          gameTreePromise: S.delay(function () {
            return S.makeGameTree(world);
          })
        }]);
      }
    } else {
      var lowerRank = S.dropRank(state.rank);
      if (lowerRank === undefined) {
        return automated([{
          description: 'Gain nothing',
          gameTreePromise: S.delay(function () {
            return S.makeGameTree(world);
          })
        }]);
      } else {
        var n = Math.min(3, 7 - world.field.length);
        return automated([{
          description:
            n == 1
            ? 'Gain a ' + lowerRank + ' Sheep card'
            : 'Gain ' + n + ' cards of ' + lowerRank + ' Sheep',
          gameTreePromise: S.delay(function () {
            var wn = S.clone(world);
            for (var i = 1; i <= n; i++)
              S.gainX(wn, lowerRank);
            return S.makeGameTree(wn);
          })
        }]);
      }
    }
  };

  cardHandlerTable['Golden Hooves'] = function (world, state) {  //{{{2
    var highestRank = max(world.field.map(function (c) {return c.rank;}));
    var chosenIndice = state.chosenIndice || [];
    var moves = [];

    world.field.forEach(function (c, i) {
      if (c.rank < highestRank && chosenIndice.indexOf(i) == -1) {
        moves.push({
          description: 'Choose ' + c.rank + ' Sheep card',
          cardRegion: 'field',
          cardIndex: i,
          gameTreePromise: S.delay(function () {
            return S.makeGameTree(world, {
              step: state.step,
              chosenIndice: (chosenIndice || []).concat([i]).sort()
            });
          })
        });
      }
    });
    if (moves.length != 0)
      moves.description = 'Choose a card in the field, or'

    moves.push({
      description:
        chosenIndice.length == 0
        ? 'Cancel'
        : 'Raise ranks of chosen Sheep cards',
      gameTreePromise: S.delay(function () {
        var wn = S.clone(world);
        for (var i = chosenIndice.length - 1; 0 <= i; i--) {
          var c = world.field[chosenIndice[i]];
          S.releaseX(wn, chosenIndice[i]);
          S.gainX(wn, S.raiseRank(c.rank));
        }
        return S.makeGameTree(wn);
      })
    });
    if (moves.length == 1)
      moves.automated = true;

    return moves;
  };

  cardHandlerTable['Inspiration'] = function (world, state) {  //{{{2
    if (world.deck.length == 0) {
      return automated([{
        description: 'No card in deck - nothing happened',
        gameTreePromise: S.delay(function () {
          return S.makeGameTree(world);
        })
      }]);
    } else if (state.searched === undefined) {
      return described('Choose a card in the deck',
        mapOn(world, 'deck', function (c, i) {
          return {
            description: 'Put ' + c.name + ' into your hand',
            gameTreePromise: S.delay(function () {
              var wn = S.clone(world);
              wn.hand.push(wn.deck.splice(i, 1)[0]);
              return S.makeGameTree(wn, {step: state.step, searched: true});
            })
          };
        })
      );
    } else {
      return automated([{
        description: 'Shuffle the deck',
        gameTreePromise: S.delay(function () {
          var wn = S.clone(world);
          shuffle(wn.deck);
          return S.makeGameTree(wn);
        })
      }]);
    }
  };

  cardHandlerTable['Lightning'] = function (world, state) {  //{{{2
    var highestRank = max(world.field.map(function (c) {return c.rank;}));
    return described('Choose a card to release in the field',
      world.field
      .map(function (c, i) {return [c, i];})
      .filter(function (x) {return x[0].rank == highestRank;})
      .map(function (x) {
        return {
          description: 'Release ' + x[0].rank + ' Sheep card',
          cardRegion: 'field',
          cardIndex: x[1],
          gameTreePromise: S.delay(function () {
            var wn = S.clone(world);
            S.releaseX(wn, x[1]);
            return S.makeGameTree(wn);
          })
        };
      })
    );
  };

  cardHandlerTable['Meteor'] = function (world, state) {  //{{{2
    var n = Math.min(state.rest || 3, world.field.length);
    return described('Choose a card to release in the field',
      mapOn(world, 'field', function (c, i) {
        return {
          description: 'Release ' + c.rank + ' Sheep card',
          gameTreePromise: S.delay(function () {
            var wn = S.clone(world);
            if (state.rest === undefined)
              S.exileX(wn, wn.discardPile, wn.discardPile.length - 1);
            S.releaseX(wn, i);
            var sn = n == 1 ? undefined : {step: state.step, rest: n - 1};
            return S.makeGameTree(wn, sn);
          })
        };
      })
    );
  };

  cardHandlerTable['Multiply'] = function (world, state) {  //{{{2
    if (world.field.length < 7 && 0 < world.sheepStock[3].length) {
      return automated([{
        description: 'Gain a 3 Sheep card',
        gameTreePromise: S.delay(function () {
          var wn = S.clone(world);
          S.gainX(wn, 3);
          return S.makeGameTree(wn);
        })
      }]);
    } else {
      return automated([{
        description: 'Nothing happened',
        gameTreePromise: S.delay(function () {
          return S.makeGameTree(world);
        })
      }]);
    }
  };

  cardHandlerTable['Plague'] = function (world, state) {  //{{{2
    return described('Choose a card to release in the field',
      mapOn(world, 'field', function (c) {
        var r = c.rank;
        return {
          description: 'Release all ' + r + ' Sheep cards',
          gameTreePromise: S.delay(function () {
            var wn = S.clone(world);
            for (var i = wn.field.length - 1; 0 <= i; i--) {
              if (wn.field[i].rank == r)
                S.releaseX(wn, i);
            }
            return S.makeGameTree(wn);
          })
        };
      })
    );
  };

  function uniq(xs) {
    var us = [];
    var found = {};
    for (var i = 0; i < xs.length; i++) {
      var x = xs[i];
      if (!found[x]) {
        us.push(x);
        found[x] = true;
      }
    }
    return us;
  }

  cardHandlerTable['Planning Sheep'] = function (world, state) {  //{{{2
    if (world.hand.length == 0) {
      return automated([{
        description: 'No card to exile - nothing happened',
        gameTreePromise: S.delay(function () {
          return S.makeGameTree(world);
        })
      }]);
    } else {
      return described('Choose a card to exile in hand',
        mapOn(world, 'hand', function (c, i) {
          return {
            description: 'Exile ' + c.name,
            gameTreePromise: S.delay(function () {
              var wn = S.clone(world);
              S.exileX(wn, wn.hand, i);
              return S.makeGameTree(wn);
            })
          };
        })
      );
    }
  };

  cardHandlerTable['Sheep Dog'] = function (world, state) {  //{{{2
    if (world.hand.length == 0) {
      return automated([{
        description: 'No card to discard - nothing happened',
        gameTreePromise: S.delay(function () {
          return S.makeGameTree(world);
        })
      }]);
    } else {
      return described('Choose a card to discard in hand',
        mapOn(world, 'hand', function (c, i) {
          return {
            description: 'Discard ' + c.name,
            gameTreePromise: S.delay(function () {
              var wn = S.clone(world);
              S.discardX(wn, i);
              return S.makeGameTree(wn);
            })
          };
        })
      );
    }
  };

  cardHandlerTable['Shephion'] = function (world, state) {  //{{{2
    return automated([{
      description: 'Release all Sheep cards',
      gameTreePromise: S.delay(function () {
        var wn = S.clone(world);
        while (1 <= wn.field.length)
          S.releaseX(wn, 0);
        return S.makeGameTree(wn);
      })
    }]);
  };

  cardHandlerTable['Slump'] = function (world, state) {  //{{{2
    if (world.field.length == 1) {
      return automated([{
        description: 'No sheep to release - nothing happened',
        gameTreePromise: S.delay(function () {
          return S.makeGameTree(world);
        })
      }]);
    } else {
      var n = state.initialCount || world.field.length;
      var countToKeep = Math.ceil(n / 2);
      return described('Choose a card to release in the field',
        mapOn(world, 'field', function (c, i) {
          return {
            description: 'Release ' + c.rank + ' Sheep card',
            gameTreePromise: S.delay(function () {
              var wn = S.clone(world);
              S.releaseX(wn, i);
              var sn = wn.field.length == countToKeep
                ? undefined
                : {step: state.step, initialCount: n};
              return S.makeGameTree(wn, sn);
            })
          };
        })
      );
    }
  };

  cardHandlerTable['Storm'] = function (world, state) {  //{{{2
    var n = Math.min(state.rest || 2, world.field.length);
    return described('Choose a card to release in the field',
      mapOn(world, 'field', function (c, i) {
        return {
          description: 'Release ' + c.rank + ' Sheep card',
          gameTreePromise: S.delay(function () {
            var wn = S.clone(world);
            S.releaseX(wn, i);
            var sn = n == 1 ? undefined : {step: state.step, rest: n - 1};
            return S.makeGameTree(wn, sn);
          })
        };
      })
    );
  };

  cardHandlerTable['Wolves'] = function (world, state) {  //{{{2
    var highestRank = max(world.field.map(function (c) {return c.rank;}));
    if (highestRank == 1)
      return cardHandlerTable['Lightning'](world, state);
    return described('Choose a card to reduce its rank in the field',
      world.field
      .map(function (c, i) {return [c, i];})
      .filter(function (x) {return x[0].rank == highestRank;})
      .map(function (x) {
        return {
          description: 'Reduce the rank of ' + x[0].rank + ' Sheep card',
          cardRegion: 'field',
          cardIndex: x[1],
          gameTreePromise: S.delay(function () {
            var wn = S.clone(world);
            S.releaseX(wn, x[1]);
            S.gainX(wn, S.dropRank(highestRank));
            return S.makeGameTree(wn);
          })
        };
      })
    );
  };

  function unimplementedCardHandler(world, state) {  //{{{2
    // TODO: Throw an error after all event cards are implemented.
    return [{
      description: 'Nothing happened (not implemented yet)',
      gameTreePromise: S.delay(function () {
        return S.makeGameTree(world);
      })
    }];
  };

  // AI  {{{1

  var aiTable = {
    random: function (gt) {
      return gt.moves[random(gt.moves.length)];
    },
    minimax: function (gt) {
      var ratings = calculateRatings(limitGameTreeDepth(gt, 4));
      var maxRating = Math.max.apply(null, ratings);
      return gt.moves[ratings.indexOf(maxRating)];
    }
  };

  function limitGameTreeDepth(gameTree, depth) {
    var moves;
    if (depth === 0) {
      moves = [];
    } else {
      moves = gameTree.moves.map(function (m) {
        return {
          description: m.description,
          cardRegion: m.cardRegion,
          cardIndex: m.cardIndex,
          gameTreePromise: S.delay(function () {
            return limitGameTreeDepth(S.force(m.gameTreePromise), depth - 1);
          })
        };
      });
      moves.automated = gameTree.moves.automated;
      moves.description = gameTree.moves.description;
    }
    return {
      world: gameTree.world,
      moves: moves
    };
  }

  function calculateRatings(gameTree) {
    return gameTree.moves.map(function (m) {
      return ratePosition(S.force(m.gameTreePromise));
    });
  }

  function ratePosition(gameTree) {
    if (1 <= gameTree.moves.length) {
      return Math.max.apply(null, calculateRatings(gameTree));
    } else {
      return scorePosition(gameTree);
    }
  }

  function scorePosition(gameTree) {
    // TODO: Improve scoring.  For example:
    // * Exile bad cards as soon as possible.
    // * Use bad cards as soon as possible if their effects are small enough.
    var sheepScore = sum(gameTree.world.field.map(scoreSheep));
    var extinctscore = gameTree.world.field.length == 0 ? -999 : 0;
    var discardPileScore = sum(gameTree.world.discardPile.map(scoreDiscardedCard));
    var exileScore = sum(gameTree.world.field.map(scoreExiledCard));
    var futureScore = scoreFuture(gameTree.world.hand, gameTree.world.deck);
    return sheepScore + extinctscore + discardPileScore + exileScore;
  }

  function scoreSheep(c) {
    return c.rank * c.rank;
  }

  function scoreDiscardedCard(c) {
    return (badCardScore[c.name] || 0) / 10;
  }

  function scoreExiledCard(c) {
    return badCardScore[c.name] || 0;
  }

  var badCardScore = {
    'Crowding': 10,
    'Falling Rock': 10,
    'Lightning': 30,
    'Meteor': 50,
    'Plague': 10,
    'Shephion': 100,
    'Slump': 10,
    'Storm': 15,
    'Wolves': 20
  };

  function scoreFuture(hand, deck) {
    var counterCount = hand.filter(isCounterCard).length +
                       deck.filter(isCounterCard).length;
    var fatalCount = hand.filter(isFatalCard).length +
                     deck.filter(isFatalCard).length;
    return counterCount >= fatalCount ? 100 : -100;
  }

  function isCounterCard(card) {
    return card.name == 'Planning Sheep' ||
           card.name == 'Sheep Dog';
  }

  function isFatalCard(card) {
    return card.name == 'Lightning' ||
           card.name == 'Shephion' ||
           card.name == 'Wolves';
  }

  // UI  {{{1
  // TODO: Add UI to quit the current game.

  function textizeCards(cs) {
    if (cs.length == 0)
      return '-';
    else
      return cs.map(function (c) {return c.name;}).join(', ');
  }

  var ruleTextFromCardNameTable = {
    'All-purpose Sheep': 'Choose a card in your hand.\nPlay this card in place of the card you chose.',
    'Be Fruitful': 'Duplicate one of your Sheep cards.',
    'Crowding': 'Release all but two Sheep cards.',
    'Dominion': 'Choose any number of Sheep cards in the Field.\nAdd their values and then replace them with\none Sheep card of equal of lesser value.',
    'Falling Rock': 'Relase one Sheep card.',
    'Fill the Earth': 'Place as many 1 Sheep cards as you like in the Field.',
    'Flourish': 'Choose one of your Sheep cards\nand receive three Sheep cards of one rank lower.',
    'Golden Hooves': 'Raise the rank of as many Sheep cards as you like,\nexcept for your highest-ranking Sheep card.',
    'Inspiration': 'Look through the deck\nand add one card of your choice to your hand,\nand then re-shuffle the deck.',
    'Lightning': 'Release your highest-ranking Sheep card.',
    'Meteor': 'Release three Sheep cards,\nand then remove this card from the game.',
    'Multiply': 'Place one 3 Sheep card in the Field.',
    'Plague': 'Release all Sheep cards of one rank.',
    'Planning Sheep': 'Remove one card in your hand from the game.',
    'Sheep Dog': 'Discard one card from your hand.',
    'Shephion': 'Release seven Sheep cards.',
    'Slump': 'Relase half of your Sheep cards (Round down.)',
    'Storm': 'Release two Sheep cards.',
    'Wolves': 'Reduce the rank of your highest-ranking sheep card by one.\nIf your highest ranaking Sheep card is 1, release it.'
  };

  function helpTextFromCard(card) {
    return card.name + '\n\n' + ruleTextFromCardNameTable[card.name];
  }

  function makeFaceDownCards(n) {
    var cards = [];
    for (var i = 0; i < n; i++)
      cards.push({name: '', type: 'face-down'});
    return cards;
  }

  function visualizeCard(card) {
    var $body = $('<span>');
    $body.addClass('body');
    $body.text(card.name);

    var $border = $('<span>');
    $border.addClass('border');
    $border.append($body);

    var $card = $('<span>');
    $card.addClass('card');
    $card.addClass(cardType(card));
    $card.addClass('rank' + card.rank);
    if (cardType(card) === 'event')
      $card.attr('title', helpTextFromCard(card));
    $card.append($border);
    return $card;
  }

  function visualizeCards(cards) {
    return cards.map(visualizeCard);
  }

  function mayBeAutomated(gameTree) {
    return gameTree.moves.automated;
  }

  function descriptionOfMoves(moves) {
    if (moves.description)
      return moves.description;

    if (moves.length == 1)
      return moves[0].description;

    return 'Choose a move';
  }

  var AUTOMATED_MOVE_DELAY = 500;
  var playerType;

  function processMove(m) {
    var gt = S.force(m.gameTreePromise);
    var v = drawGameTree(gt);
    if (gt.moves.length == 0) {
      $('#message').text(S.judgeGame(gt.world).description);
      $('#preferencePane').show();
    } else {
      if (mayBeAutomated(gt)) {
        setTimeout(
          function () {processMove(gt.moves[0]);},
          AUTOMATED_MOVE_DELAY
        );
      } else {
        if (playerType == 'human') {
          setUpUIToChooseMove(gt, v);
        } else {
          setTimeout(
            function () {processMove(aiTable[playerType](gt));},
            AUTOMATED_MOVE_DELAY * 2
          );
        }
      }
    }
  }

  function nodizeMove(m) {
    var $m = $('<input>');
    $m.attr({
      type: 'button',
      value: m.description
    });
    $m.click(function () {
      processMove(m);
    });
    return $m;
  }

  function drawGameTree(gameTree) {
    var w = gameTree.world;
    var deckRevealed = gameTree.moves.some(function (m) {
      return m.cardRegion === 'deck';
    });
    $('#enemySheepCount > .count').text(w.enemySheepCount);
    var v = {
      deck: visualizeCards(deckRevealed ? w.deck : makeFaceDownCards(w.deck.length)),
      field: visualizeCards(w.field),
      hand: visualizeCards(w.hand)
    };
    S.RANKS.forEach(function (rank) {
      var vcs = visualizeCards(w.sheepStock[rank]);
      v['sheepStock' + rank] = vcs;
      $('#sheepStock' + rank).html(vcs);
    });
    $('#field > .cards').html(v.field);
    $('#hand > .cards').html(v.hand);
    $('#deck > .cards').html(v.deck).toggleClass('lined', !deckRevealed);
    $('#discardPile > .cards').html(visualizeCards(w.discardPile));
    $('#exile > .cards').html(visualizeCards(w.exile));
    $('#message').text(descriptionOfMoves(gameTree.moves));
    $('#moves').empty();
    return v;
  }

  function setUpUIToChooseMove(gameTree, v) {
    gameTree.moves
      .filter(function (m) {return m.cardRegion !== undefined;})
      .forEach(function (m) {
        v[m.cardRegion][m.cardIndex]
          .addClass('clickable')
          .click(function () {
            processMove(m);
          });
      });
    $('#moves')
      .append(
        gameTree.moves
        .filter(function (m) {return m.cardRegion === undefined;})
        .map(nodizeMove)
      );
  }

  function startNewGame() {
    playerType = $('#playerType').val();
    processMove(S.makeGameTree(S.makeInitalWorld()).moves[0]);
    $('#preferencePane').hide();
  }




  // Bootstrap  {{{1

  $(function () {
    $('#playerTypeForm').toggle(location.hash === '#ai');
    $('#startButton').click(startNewGame);
    drawGameTree(S.makeGameTree(S.makeInitalWorld()));
  });

  //}}}1
})(shephy, jQuery);

// vim: expandtab softtabstop=2 shiftwidth=2 foldmethod=marker
