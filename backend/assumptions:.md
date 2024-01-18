assumptions:

- if db crashes but broker api is live, this creates an issue of unrecorded trades - unsure how trade could be correlated back as a free share purchase in this case.

- assumption is you can submit a limit order ia market api - to potentially be filled at open if available, or rejected/cancelled. If this is not the case, you'd need to send the order to some kind of async job scheduler, which would record the trade as pending on emma db, to be executed at market open - IF the specified price (or better) is still available.

- assume get tradeable assets method returns all - obviously in the rela world there is a limit and pagintion may be required.

- assume we have access to the broker db, or at least have access to near real time statuses of account trade data.
