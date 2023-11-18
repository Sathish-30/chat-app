package com.jarvis.chatapp.config;

import com.jarvis.chatapp.chat.ChatMessage;
import com.jarvis.chatapp.chat.MessageType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {
    private final SimpMessageSendingOperations messageTemplate;
    @EventListener
    public void handelWebSocketDisconnectListener(SessionDisconnectEvent event){
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String userName =(String)headerAccessor.getSessionAttributes().get("username");
        if(userName != null){
            log.info("User disconnected {}",userName);
            var chatMessage = ChatMessage.builder()
                    .type(MessageType.LEAVER)
                    .sender(userName)
                    .build();
            messageTemplate.convertAndSend("/topic/public",chatMessage);
        }

    }
}
