import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../style/Single-Game.css';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { GiCardPlay } from 'react-icons/gi';
import { AiOutlineSwap } from 'react-icons/ai';
import Footer from '../components/Footer';
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import * as gameService from '../services/singleGameService';
import * as playerService from '../services/playerService';
import Modal from '../components/Modal';
import LoadingComponent from '../components/Loading';
import ArrowBack from '../components/atoms/ArrowBack';
import TopAppBar from '../components/TopAppBar';
import { format } from 'date-fns';

/**
 * SingleGame Component:
 *
 * Displays the details of a single game. It includes player appearances, game events,
 * and the ability to view detailed information about each player and event.
 *
 * Behavior:
 * - On load, fetches the game details, player appearances, and game events using respective services.
 * - Displays the game information, players involved, and game events in a structured format.
 * - Users can click on a player to view more details or interact with the game events.
 *
 * @returns {JSX.Element} The JSX for the SingleGame page.
 */

const SingleGame = () => {
  const links = [true, true, true];
  const navigate = useNavigate();
  const { gameId } = useParams();

  const [playersAppearances, setPlayerAppearances] = useState(null);
  const [gameEvents, setGameEvents] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openModalPlayerId, setOpenModalPlayerId] = useState(null);

  const [game, setGame] = useState(null);
  const [view, setView] = useState(0);
  let clubAwayLogo = '';
  let clubHomeLogo = '';

  if (game) {
    clubAwayLogo =
      'https://tmssl.akamaized.net/images/wappen/head/' +
      game.away_club_id +
      '.png?';
    clubHomeLogo =
      'https://tmssl.akamaized.net/images/wappen/head/' +
      game.home_club_id +
      '.png?';
  }

  const handleModalClick = (playerId) => {
    if (openModalPlayerId === playerId) {
      setOpenModalPlayerId(null);
    } else {
      setOpenModalPlayerId(playerId);
    }
  };

  const isModalOpenForPlayer = (playerId) => {
    return openModalPlayerId === playerId;
  };

  const handleModalClose = () => {
    setOpenModalPlayerId(null);
  };

  function getEventIcon(eventType) {
    switch (eventType) {
      case 'Goals':
        return <SportsSoccerIcon />;
      case 'Cards':
        return <GiCardPlay />;
      case 'Substitutions':
        return <AiOutlineSwap />;
      default:
        return null;
    }
  }

  useEffect(() => {
    let promises = [];
    promises.push(
      gameService
        .getGameEventsById(gameId)
        .then((response) => {
          const sortedData = response.data.sort((a, b) => a.minute - b.minute);
          setGameEvents(sortedData);
        })
        .catch((error) => {
          console.error(error);
        }),

      playerService
        .getAppearancesByGameId(gameId)
        .then((response) => {
          setPlayerAppearances(response.data);
        })
        .catch((error) => {
          console.error(error);
        }),

      gameService
        .getGameById(gameId)
        .then((response) => {
          setGame(response.data[0]);
        })
        .catch((error) => {
          console.error(error);
        })
    );

    Promise.all(promises).then((value) => {
      setIsLoading(false);
    });
  }, [gameId]);

  const processDescription = (description) => {
    if (description !== undefined) {
      if (description.includes(',')) {
        let parts = description.split(',');
        return parts[1];
      } else {
        return description.trim();
      }
    }
    return '';
  };

  const handleChangeTab = (event, newValue) => {
    setView(newValue);
  };

  const renderGoalsIcons = (goals) => {
    let result = '';
    for (let i = 0; i < goals; i++) {
      result += '⚽ ';
    }
    result += ' ';
    return result;
  };

  function getPlayerNameById(playerId) {
    if (!playersAppearances) return 'Loading player data';
    const player = playersAppearances.find((p) => p.player_id === playerId);
    return player ? player.player_name : 'Player not found';
  }

  if (isLoading) {
    return <LoadingComponent type={'spinningBubbles'} color={'#0c2840'} />;
  }

  return (
    <div className="teams-container">
      <div className="header-container">
        <TopAppBar links={links} />
      </div>
      <div className="container-background-color">
        <div className="container-date">
          <b>
            <h1>{format(new Date(game.date), 'dd-MM-yyyy')}</h1>
          </b>
        </div>
        <div className="page-title-container">
          <div className="page-header-club">
            <img
              src={clubHomeLogo}
              alt={game.home_club_name}
              onClick={() => navigate(`/single-team/${game.home_club_id}`)}
            />
            <h1 className="page-title">{game.home_club_name}</h1>
          </div>
          <div>
            <h1>| {game.aggregate} |</h1>
          </div>
          <div className="page-header-club">
            <img
              src={clubAwayLogo}
              alt={game.away_club_name}
              onClick={() => navigate(`/single-team/${game.away_club_id}`)}
            />
            <h1 className="page-title">{game.away_club_name}</h1>
          </div>
        </div>

        <div id="buttons">
          <Box
            sx={{
              borderBottom: 2,
              borderColor: 'divider',
              marginBottom: '5px',
            }}
          >
            <Tabs
              value={view}
              aria-label="basic tabs example"
              onChange={handleChangeTab}
            >
              <Tab label="Timeline" value={0} />
              <Tab label="Players" value={1} />
            </Tabs>
          </Box>
        </div>
      </div>

      <div className="middle-container-background-color">
        {view === 0 ? (
          <div>
            <VerticalTimeline>
              {gameEvents &&
                gameEvents.map((event, index) => (
                  <VerticalTimelineElement
                    key={index}
                    date={`${event.minute}'`}
                    iconStyle={{
                      background: 'rgb(33, 150, 243)',
                      color: 'yellow',
                    }}
                    style={{ color: 'black' }}
                    icon={getEventIcon(event.type, event)}
                  >
                    <h3 className="vertical-timeline-element-title">
                      {event.type}
                      <img
                        src={
                          event.club_id === game.away_club_id
                            ? clubAwayLogo
                            : clubHomeLogo
                        }
                        alt="Club Logo"
                        style={{ width: '5%', marginLeft: '20px' }}
                      />
                    </h3>
                    <p>{processDescription(event.description)}</p>
                    <p onClick={() => navigate(`/player/${event.player_id}`)}>
                      {getPlayerNameById(event.player_id)}
                    </p>
                  </VerticalTimelineElement>
                ))}
            </VerticalTimeline>
          </div>
        ) : view === 1 ? (
          <div className="game-info-container">
            <div className="team-left">
              {playersAppearances
                .filter((player) => player.player_club_id === game.home_club_id)
                .map((player) => (
                  <div key={player.player_id}>
                    <button
                      className="dropdown-button"
                      onClick={() => handleModalClick(player.player_id)}
                    >
                      {renderGoalsIcons(player.goals)}
                      {player.assists > 0 && '🅰️  '}
                      {player.yellow_cards === 1 && '🟡   '}
                      {(player.yellow_cards > 1 || player.red_cards > 0) &&
                        '🔴   '}
                      {player.player_name}
                    </button>

                    <Modal
                      player_id={player.player_id}
                      open={isModalOpenForPlayer(player.player_id)}
                      onClose={() => handleModalClose}
                    >
                      <div className="column">
                        Yellow Cards: {player.yellow_cards}
                        <br />
                        Red Cards: {player.red_cards}
                      </div>
                      <div className="column">
                        Goals: {player.goals}
                        <br />
                        Assists: {player.assists}
                      </div>
                      <div className="column">
                        Minutes Played: {player.minutes_played}
                      </div>
                    </Modal>
                  </div>
                ))}
            </div>

            <div className="team-right">
              {playersAppearances
                .filter((player) => player.player_club_id !== game.home_club_id)
                .map((player) => (
                  <div key={player.player_id}>
                    <button
                      className="dropdown-button"
                      onClick={() => handleModalClick(player.player_id)}
                    >
                      {renderGoalsIcons(player.goals)}
                      {player.assists > 0 && '🅰️ '}
                      {player.yellow_cards === 1 && '🟨   '}
                      {(player.yellow_cards > 1 || player.red_cards > 0) &&
                        '🟥   '}
                      {player.player_name}
                    </button>
                    <Modal
                      player_id={player.player_id}
                      open={isModalOpenForPlayer(player.player_id)}
                      onClose={() => handleModalClose}
                    >
                      <div className="column">
                        Yellow Cards: {player.yellow_cards}
                        <br />
                        Red Cards: {player.red_cards}
                      </div>
                      <div className="column">
                        Goals: {player.goals}
                        <br />
                        Assists: {player.assists}
                      </div>
                      <div className="column">
                        Minutes Played: {player.minutes_played}
                      </div>
                    </Modal>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div></div>
        )}
        <ArrowBack />
        <Footer />
      </div>
    </div>
  );
};

export default SingleGame;
